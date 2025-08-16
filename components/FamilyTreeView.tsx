import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../constants/Colors';
import { FamilyMember } from '../types/family';
import { 
  getMemberDisplayName, 
  getMemberGender, 
  groupChildrenByMother,
  getFather,
  getMothers,
  getChildren
} from '../utils/familyHelpers';

const { width, height } = Dimensions.get('window');

interface TreeNode {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  spouse?: TreeNode;
  children: TreeNode[];
  x?: number;
  y?: number;
  avatarUrl?: string;
  joinId?: string;
  relationship?: string;
  isLinkedMember?: boolean;
  sourceFamily?: string;
}

interface FamilyTreeViewProps {
  familyMembers: FamilyMember[];
  onMemberSelect?: (memberId: string) => void;
  onAddMember?: () => void;
}

export default function FamilyTreeView({ familyMembers, onMemberSelect, onAddMember }: FamilyTreeViewProps) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  useEffect(() => {
    console.log('FamilyTreeView received members:', familyMembers);
    console.log('FamilyTreeView members count:', familyMembers?.length);
    console.log('FamilyTreeView members data:', JSON.stringify(familyMembers, null, 2));
    
    if (familyMembers && familyMembers.length > 0) {
      // Log each member's name-related fields
      familyMembers.forEach((member, index) => {
        console.log(`Member ${index + 1}:`, {
          id: member.id,
          name: member.name,
          fullName: member.fullName,
          firstName: member.firstName,
          lastName: member.lastName,
          relationship: member.relationship,
          hasName: !!member.name,
          hasFullName: !!member.fullName,
          hasFirstName: !!member.firstName,
          hasLastName: !!member.lastName
        });
      });
      
      const tree = buildFamilyTree(familyMembers);
      console.log('Built tree data:', tree);
      setTreeData(tree);
    } else {
      console.log('No family members, setting tree data to null');
      setTreeData(null);
    }
  }, [familyMembers]);

  const buildFamilyTree = (members: FamilyMember[]): TreeNode => {
    console.log('Building tree with members:', members);
    
    if (!members || members.length === 0) {
      return {
        id: 'empty',
        name: 'No Family Members',
        gender: 'male',
        birthYear: '',
        isDeceased: false,
        children: []
      };
    }
    
    // Debug: Log each member's properties
    console.log('Raw members data:', members);
    members.forEach((member, index) => {
      console.log(`Member ${index + 1}:`, {
        id: member.id,
        name: member.name,
        firstName: member.firstName,
        lastName: member.lastName,
        relationship: member.relationship,
        birthYear: member.birthYear,
        motherId: member.motherId,
        parentType: member.parentType,
        hasName: !!member.name,
        hasFirstName: !!member.firstName,
        hasLastName: !!member.lastName
      });
    });
    
    // Validate members have required properties
    const validMembers = members.filter(member => 
      member && 
      member.id && 
      member.relationship && 
      member.birthYear
    );
    
    if (validMembers.length === 0) {
      return {
        id: 'empty',
        name: 'No Family Members',
        gender: 'male',
        birthYear: '',
        isDeceased: false,
        children: []
      };
    }

    // Find the father (root of the tree)
    const father = getFather(validMembers);

    // Find all mothers/wives
    const mothers = getMothers(validMembers);

    // Find all children
    const children = getChildren(validMembers);

    console.log('Father found:', father);
    console.log('Mothers found:', mothers);
    console.log('Children found:', children);

    // If no father found, create a fallback structure
    if (!father) {
      console.log('No father found, creating fallback structure');
      // Return the first member as root, or create a simple structure
      if (validMembers.length > 0) {
        const firstMember = validMembers[0];
        return {
          id: firstMember.id,
          name: getMemberDisplayName(firstMember),
          gender: getMemberGender(firstMember),
          birthYear: firstMember.birthYear,
          isDeceased: firstMember.isDeceased,
          deathYear: firstMember.deathYear,
          avatarUrl: firstMember.avatarUrl,
          joinId: firstMember.joinId,
          relationship: firstMember.relationship,
          isLinkedMember: firstMember.isLinkedMember,
          sourceFamily: firstMember.sourceFamily,
          children: validMembers.slice(1).map(member => ({
            id: member.id,
            name: getMemberDisplayName(member),
            gender: getMemberGender(member),
            birthYear: member.birthYear,
            isDeceased: member.isDeceased,
            deathYear: member.deathYear,
            avatarUrl: member.avatarUrl,
            joinId: member.joinId,
            relationship: member.relationship,
            isLinkedMember: member.isLinkedMember,
            sourceFamily: member.sourceFamily,
            children: []
          }))
        };
      } else {
        return {
          id: 'empty',
          name: 'No Family Members',
          gender: 'male',
          birthYear: '',
          isDeceased: false,
          children: []
        };
      }
    }

    // Create father node
    const fatherNode: TreeNode = {
      id: father.id,
      name: getMemberDisplayName(father),
      gender: getMemberGender(father),
      birthYear: father.birthYear,
      isDeceased: father.isDeceased,
      deathYear: father.deathYear,
      avatarUrl: father.avatarUrl,
      joinId: father.joinId,
      relationship: father.relationship,
      isLinkedMember: father.isLinkedMember,
      sourceFamily: father.sourceFamily,
      children: []
    };

    // Group children by their mother
    const childrenByMother = groupChildrenByMother(validMembers);

    // Create mother nodes with their children
    const motherNodes: TreeNode[] = mothers.map(mother => {
      const motherChildren = childrenByMother.get(mother.id) || [];
      
      const motherNode: TreeNode = {
        id: mother.id,
        name: getMemberDisplayName(mother),
        gender: getMemberGender(mother),
        birthYear: mother.birthYear,
        isDeceased: mother.isDeceased,
        deathYear: mother.deathYear,
        avatarUrl: mother.avatarUrl,
        joinId: mother.joinId,
        relationship: mother.relationship,
        isLinkedMember: mother.isLinkedMember,
        sourceFamily: mother.sourceFamily,
        children: motherChildren.map(child => ({
          id: child.id,
          name: getMemberDisplayName(child),
          gender: getMemberGender(child),
          birthYear: child.birthYear,
          isDeceased: child.isDeceased,
          deathYear: child.deathYear,
          avatarUrl: child.avatarUrl,
          joinId: child.joinId,
          relationship: child.relationship,
          isLinkedMember: child.isLinkedMember,
          sourceFamily: child.sourceFamily,
          children: []
        }))
      };

      return motherNode;
    });

    // Set mother nodes as children of father
    fatherNode.children = motherNodes;

    // Return father as the root node (no wrapper "Family" node)
    console.log('Built tree structure:', fatherNode);
    return fatherNode;
  };

  const generateHTML = (data: TreeNode, parents: FamilyMember[]) => {
    if (!data) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #f8fafc;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
            }
            .no-data {
              text-align: center;
              color: #6b7280;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="no-data">No family data available</div>
        </body>
        </html>
      `;
    }
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://d3js.org/d3.v7.min.js"></script>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            overflow: hidden;
          }
          
          .tree-container {
            width: 100vw;
            height: 100vh;
            position: relative;
          }
          
          .node {
            cursor: pointer;
            transition: all 0.3s ease;
          }
          
          .node:hover {
            transform: scale(1.05);
          }
          
                     .node-card {
             fill: rgba(255, 255, 255, 1);
             stroke: rgba(0, 0, 0, 0.2);
             stroke-width: 2;
             rx: 20;
             ry: 20;
             filter: drop-shadow(0 6px 20px rgba(0,0,0,0.25)) drop-shadow(0 3px 10px rgba(0,0,0,0.15));
             cursor: pointer;
             transition: all 0.3s ease;
           }
           
           .node-card:hover {
             fill: rgba(255, 255, 255, 1);
             stroke: rgba(0, 0, 0, 0.3);
             transform: scale(1.03);
             filter: drop-shadow(0 8px 25px rgba(0,0,0,0.3)) drop-shadow(0 4px 12px rgba(0,0,0,0.2));
           }
          
                     .node-card.male {
             fill: rgba(255, 255, 255, 1);
             stroke: rgba(0, 0, 0, 0.2);
           }
           
           .node-card.male:hover {
             fill: rgba(255, 255, 255, 1);
             stroke: rgba(0, 0, 0, 0.3);
           }
           
           .node-card.female {
             fill: rgba(255, 255, 255, 1);
             stroke: rgba(0, 0, 0, 0.2);
           }
           
                     .node-card.female:hover {
            fill: rgba(255, 255, 255, 1);
            stroke: rgba(0, 0, 0, 0.3);
          }
          
          .node-card.linked {
            fill: rgba(236, 254, 255, 1);
            stroke: #0891b2;
            stroke-width: 2;
            stroke-dasharray: 5,5;
          }
          
          .node-card.linked:hover {
            fill: rgba(207, 250, 254, 1);
            stroke: #0e7490;
            stroke-width: 3;
          }
          
          .node-card.selected {
            stroke: #10b981;
            stroke-width: 3;
            filter: drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3));
          }
          
          .gender-icon {
            fill: #3b82f6;
          }
          
          .gender-icon.female {
            fill: #f59e0b;
          }
          
                     .name-text {
             font-size: 15px;
             font-weight: 800;
             fill: #111827;
             text-anchor: middle;
             letter-spacing: 0.025em;
           }
          
                     .year-text {
             font-size: 12px;
             fill: #4b5563;
             text-anchor: middle;
             font-weight: 600;
           }
           
           .profile-picture {
             rx: 25;
             ry: 25;
             filter: drop-shadow(0 4px 8px rgba(0,0,0,0.15));
           }
           
           .id-text {
             font-size: 10px;
             fill: #6b7280;
             text-anchor: middle;
             font-family: 'Courier New', monospace;
             font-weight: 700;
             letter-spacing: 0.05em;
           }
           
           .source-family-text {
             font-size: 9px;
             fill: #0891b2;
             text-anchor: middle;
             font-weight: 600;
             font-style: italic;
           }
           
           .relationship-text {
             font-size: 11px;
             fill: #374151;
             text-anchor: middle;
             font-weight: 600;
             text-transform: capitalize;
           }
          
          .link {
            fill: none;
            stroke: #94a3b8;
            stroke-width: 2;
          }
          
          .marriage-line {
            stroke: #f59e0b;
            stroke-width: 3;
            stroke-dasharray: 5,5;
          }
          
          .marriage-symbol {
            fill: #f59e0b;
            stroke: #f59e0b;
            stroke-width: 2;
          }
          
          .parent-connection-line {
            transition: all 0.3s ease;
          }
          
          .parent-connection-line:hover {
            stroke-width: 2;
            opacity: 0.8 !important;
          }
          
          .relationship-heart {
            transition: all 0.3s ease;
          }
          
          .relationship-heart:hover {
            transform: scale(1.1);
            opacity: 0.9 !important;
          }
           
           .modal-overlay {
             position: fixed;
             top: 0;
             left: 0;
             width: 100%;
             height: 100%;
             background: rgba(0, 0, 0, 0.7);
             display: flex;
             justify-content: center;
             align-items: center;
             z-index: 10000;
             backdrop-filter: blur(5px);
           }
           
           .modal-content {
             background: rgba(255, 255, 255, 0.95);
             border-radius: 20px;
             padding: 30px;
             max-width: 400px;
             width: 90%;
             box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
             backdrop-filter: blur(20px);
             border: 1px solid rgba(255, 255, 255, 0.3);
           }
           
           .modal-header {
             display: flex;
             justify-content: space-between;
             align-items: center;
             margin-bottom: 20px;
           }
           
           .modal-title {
             font-size: 24px;
             font-weight: 700;
             color: #1f2937;
             margin: 0;
           }
           
           .modal-close {
             background: none;
             border: none;
             font-size: 24px;
             cursor: pointer;
             color: #6b7280;
             padding: 5px;
             border-radius: 50%;
             transition: all 0.2s ease;
           }
           
           .modal-close:hover {
             background: rgba(0, 0, 0, 0.1);
             color: #374151;
           }
           
           .modal-profile-pic {
             width: 120px;
             height: 120px;
             border-radius: 60px;
             margin: 0 auto 20px;
             display: block;
             object-fit: cover;
             border: 3px solid rgba(255, 255, 255, 0.5);
             box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
           }
           
           .modal-details {
             margin-bottom: 20px;
           }
           
           .detail-row {
             display: flex;
             justify-content: space-between;
             align-items: center;
             padding: 12px 0;
             border-bottom: 1px solid rgba(0, 0, 0, 0.1);
           }
           
           .detail-label {
             font-weight: 600;
             color: #6b7280;
             font-size: 14px;
           }
           
           .detail-value {
             font-weight: 500;
             color: #1f2937;
             font-size: 14px;
             text-align: right;
           }
           
           .id-section {
             background: rgba(59, 130, 246, 0.1);
             border-radius: 12px;
             padding: 15px;
             margin-top: 20px;
             border: 1px solid rgba(59, 130, 246, 0.2);
           }
           
           .id-label {
             font-weight: 600;
             color: #3b82f6;
             font-size: 12px;
             margin-bottom: 8px;
           }
           
           .id-value {
             font-family: 'Courier New', monospace;
             font-size: 16px;
             font-weight: 700;
             color: #1f2937;
             background: rgba(255, 255, 255, 0.8);
             padding: 8px 12px;
             border-radius: 8px;
             border: 1px solid rgba(0, 0, 0, 0.1);
             margin-bottom: 10px;
           }
           
           .copy-btn {
             background: #3b82f6;
             color: white;
             border: none;
             padding: 8px 16px;
             border-radius: 8px;
             font-size: 12px;
             font-weight: 600;
             cursor: pointer;
             transition: all 0.2s ease;
           }
           
           .copy-btn:hover {
             background: #2563eb;
             transform: translateY(-1px);
           }
           
           .copy-btn:active {
             transform: translateY(0);
           }
          
          .zoom-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border-radius: 8px;
            padding: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 1000;
          }
          
          .zoom-btn {
            display: block;
            width: 40px;
            height: 40px;
            margin: 5px 0;
            border: none;
            border-radius: 6px;
            background: #3b82f6;
            color: white;
            font-size: 18px;
            cursor: pointer;
            transition: background 0.2s;
          }
          
          .zoom-btn:hover {
            background: #2563eb;
          }
          
          .add-member-controls {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
          }
          
          .add-member-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 25px;
            padding: 12px 20px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transition: all 0.3s ease;
          }
          
          .add-member-btn:hover {
            background: #059669;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
          }
          
          .add-member-btn:active {
            transform: translateY(0);
          }
          
          .add-icon {
            font-size: 18px;
            font-weight: bold;
          }
          
          .add-text {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
        </style>
      </head>
      <body>
        <div class="tree-container">
          <div class="zoom-controls">
            <button class="zoom-btn" onclick="zoomIn()">+</button>
            <button class="zoom-btn" onclick="zoomOut()">-</button>
            <button class="zoom-btn" onclick="resetZoom()">⌂</button>
          </div>
          <div class="add-member-controls">
            <button class="add-member-btn" onclick="addMember()">
              <span class="add-icon">+</span>
              <span class="add-text">Add Member</span>
            </button>
          </div>
          <div id="tree"></div>
        </div>
        
        <!-- Member Details Modal -->
        <div id="memberModal" class="modal-overlay" style="display: none;">
          <div class="modal-content">
            <div class="modal-header">
              <h2 class="modal-title" id="modalTitle">Member Details</h2>
              <button class="modal-close" onclick="closeModal()">&times;</button>
            </div>
            <img id="modalProfilePic" class="modal-profile-pic" src="" alt="Profile Picture">
            <div class="modal-details">
              <div class="detail-row">
                <span class="detail-label">Full Name:</span>
                <span class="detail-value" id="modalFullName">-</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Relationship:</span>
                <span class="detail-value" id="modalRelationship">-</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Birth Year:</span>
                <span class="detail-value" id="modalBirthYear">-</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Address:</span>
                <span class="detail-value" id="modalAddress">-</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Phone:</span>
                <span class="detail-value" id="modalPhone">-</span>
              </div>
            </div>
            <div class="id-section">
              <div class="id-label">Unique ID</div>
              <div class="id-value" id="modalId">-</div>
              <button class="copy-btn" onclick="copyId()">Copy ID</button>
            </div>
          </div>
        </div>
        
                 <script>
           const data = ${JSON.stringify(data)};
           const parents = ${JSON.stringify(parents)};
           let currentZoom = 1;
           let selectedNode = null;
           let currentMemberData = null;
           
           // Modal functions
           function showMemberDetails(memberData) {
             currentMemberData = memberData;
             
             // Update modal content
             document.getElementById('modalTitle').textContent = memberData.name;
             document.getElementById('modalFullName').textContent = memberData.name;
             document.getElementById('modalRelationship').textContent = memberData.relationship || 'N/A';
             document.getElementById('modalBirthYear').textContent = memberData.birthYear || 'N/A';
             document.getElementById('modalAddress').textContent = 'Address not available'; // Placeholder
             document.getElementById('modalPhone').textContent = 'Phone not available'; // Placeholder
             document.getElementById('modalId').textContent = memberData.joinId || 'N/A';
             
             // Update profile picture
             const profilePic = document.getElementById('modalProfilePic');
             if (memberData.avatarUrl) {
               profilePic.src = memberData.avatarUrl;
             } else {
               profilePic.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjYwIiBjeT0iNjAiIHI9IjYwIiBmaWxsPSIjOUNBM0FGIi8+CjxzdmcgeD0iMzAiIHk9IjMwIiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPgo8cGF0aCBkPSJNMTIgMTJjMi4yMSAwIDQtMS43OSA0LTQtMS43OS00LTQtNC00IDQgMCAyLjIxIDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo=';
             }
             
             // Show modal
             document.getElementById('memberModal').style.display = 'flex';
           }
           
           function closeModal() {
             document.getElementById('memberModal').style.display = 'none';
             currentMemberData = null;
           }
           
           function copyId() {
             if (currentMemberData && currentMemberData.joinId) {
               navigator.clipboard.writeText(currentMemberData.joinId).then(function() {
                 const copyBtn = document.querySelector('.copy-btn');
                 const originalText = copyBtn.textContent;
                 copyBtn.textContent = 'Copied!';
                 copyBtn.style.background = '#10b981';
                 
                 setTimeout(function() {
                   copyBtn.textContent = originalText;
                   copyBtn.style.background = '#3b82f6';
                 }, 2000);
               }).catch(function(err) {
                 console.error('Failed to copy: ', err);
                 alert('Failed to copy ID to clipboard');
               });
             }
           }
           
           // Close modal when clicking outside
           document.addEventListener('click', function(event) {
             const modal = document.getElementById('memberModal');
             if (event.target === modal) {
               closeModal();
             }
           });
          
           // Set up the tree layout
           const margin = { top: 50, right: 50, bottom: 50, left: 50 };
           const containerWidth = window.innerWidth - margin.left - margin.right;
           const containerHeight = window.innerHeight - margin.top - margin.bottom;
           
           // Create the hierarchy
           const root = d3.hierarchy(data);
           
           // Custom positioning for the new tree structure
           function positionTree(root) {
             // Father at the top center (root is now the father) - positioned higher
             root.x = containerWidth / 2;
             root.y = 50; // Moved higher from 100
             
             // Position mothers horizontally under father - with much more vertical space
             if (root.children && root.children.length > 0) {
               const mothers = root.children;
               const motherCount = mothers.length;
               
               // Calculate much wider spacing between mothers
               const minSpacing = 400; // Increased from 200
               const maxSpacing = 600; // Increased from 400
               const totalWidth = Math.max(containerWidth, motherCount * minSpacing);
               const spacing = Math.max(minSpacing, Math.min(maxSpacing, totalWidth / (motherCount + 1)));
               
               // Calculate the total width needed for all mothers
               const totalMotherWidth = (motherCount - 1) * spacing;
               const startX = (containerWidth - totalMotherWidth) / 2; // Center the mothers
               
               mothers.forEach((mother, index) => {
                 mother.x = startX + index * spacing;
                 mother.y = 500; // Increased gap from 400 to 500 (450px gap from father)
                 
                 // Position children horizontally under their respective mothers
                 if (mother.children && mother.children.length > 0) {
                   const children = mother.children;
                   const childCount = children.length;
                   
                   // Calculate child spacing for horizontal arrangement
                   const childSpacing = 250; // Fixed spacing between children
                   const totalChildWidth = (childCount - 1) * childSpacing;
                   const childStartX = mother.x - totalChildWidth / 2; // Center children under mother
                   
                   children.forEach((child, childIndex) => {
                     child.x = childStartX + childIndex * childSpacing;
                     child.y = 850; // Much lower position for horizontal child layout (350px gap from mothers)
                   });
                 }
               });
             }
           }
           
           // Apply custom positioning
           positionTree(root);
          
          // Create SVG
          const svg = d3.select("#tree")
            .append("svg")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight);
          
          // Add zoom behavior
          const zoom = d3.zoom()
            .scaleExtent([0.1, 3])
            .on("zoom", (event) => {
              svg.select("g").attr("transform", event.transform);
              currentZoom = event.transform.k;
            });
          
          svg.call(zoom);
          
          // Create a group for the tree
          const g = svg.append("g")
            .attr("transform", \`translate(\${margin.left}, \${margin.top})\`);
          
          // Draw links between nodes
          const links = g.selectAll(".link")
            .data(root.links())
            .enter().append("path")
            .attr("class", "link")
            .attr("d", d3.linkVertical()
              .x(d => d.x)
              .y(d => d.y));
          
          // Create node groups for all nodes
          const nodes = g.selectAll(".node")
            .data(root.descendants())
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", d => \`translate(\${d.x}, \${d.y})\`)
            .on("click", function(event, d) {
              // Handle node selection
              if (selectedNode) {
                selectedNode.select(".node-card").classed("selected", false);
              }
              selectedNode = d3.select(this);
              selectedNode.select(".node-card").classed("selected", true);
              
              // Send message to React Native
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'nodeSelected',
                nodeId: d.data.id
              }));
            });
          
          // Draw node cards (wider for better visibility)
          nodes.append("rect")
            .attr("class", d => \`node-card \${d.data.gender}\${d.data.isLinkedMember ? ' linked' : ''}\`)
            .attr("x", -80)
            .attr("y", -70)
            .attr("width", 160)
            .attr("height", 140);
          
          // Draw profile pictures (always show image, use placeholder if no avatar)
          nodes.each(function(d) {
            const node = d3.select(this);
            const data = d.data;
            
            const profileImage = node.append("image")
              .attr("class", "profile-picture")
              .attr("x", -30)
              .attr("y", -65)
              .attr("width", 60)
              .attr("height", 60)
              .attr("href", data.avatarUrl || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2ZyB4PSIxMCIgeT0iMTAiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJ3aGl0ZSI+CjxwYXRoIGQ9Ik0xMiAxMmMyLjIxIDAgNC0xLjc5IDQtNHMtMS43OS00LTQtNC00IDEuNzktNCA0IDEuNzkgNCA0IDR6bTAgMmMtMi42NyAwLTggMS4zNC04IDR2MmgxNnYtMmMwLTIuNjYtNS4zMy00LTgtNHoiLz4KPC9zdmc+Cjwvc3ZnPgo=');
            
            // Add click handler for the profile picture
            profileImage.on("click", function(event) {
              event.stopPropagation();
              showMemberDetails(data);
            });
          });
          
          // Draw names (with more space for full name)
          nodes.append("text")
            .attr("class", "name-text")
            .attr("y", 15)
            .text(d => d.data.name.length > 20 ? d.data.name.substring(0, 20) + '...' : d.data.name);
          
          // Draw relationship
          nodes.append("text")
            .attr("class", "relationship-text")
            .attr("y", 35)
            .text(d => d.data.relationship || '');
          
          // Draw years
          nodes.append("text")
            .attr("class", "year-text")
            .attr("y", 50)
            .text(d => {
              let text = d.data.birthYear;
              if (d.data.isDeceased && d.data.deathYear) {
                text += ' - ' + d.data.deathYear;
              }
              return text;
            });
          
          // Draw unique IDs
          nodes.append("text")
            .attr("class", "id-text")
            .attr("y", 65)
            .text(d => d.data.joinId ? 'ID: ' + d.data.joinId.substring(0, 6) : '');
          
          // Draw source family for linked members
          nodes.append("text")
            .attr("class", "source-family-text")
            .attr("y", 80)
            .text(d => d.data.isLinkedMember && d.data.sourceFamily ? \`From: \${d.data.sourceFamily}\` : '');
          
          // Zoom functions
          function zoomIn() {
            svg.transition().duration(300).call(zoom.scaleBy, 1.3);
          }
          
          function zoomOut() {
            svg.transition().duration(300).call(zoom.scaleBy, 0.7);
          }
          
          function resetZoom() {
            svg.transition().duration(300).call(zoom.transform, d3.zoomIdentity);
          }
          
          function addMember() {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'addMember'
            }));
          }
          
          // Handle window resize
          window.addEventListener('resize', () => {
            location.reload();
          });
        </script>
      </body>
      </html>
    `;
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'nodeSelected' && onMemberSelect) {
        onMemberSelect(data.nodeId);
      } else if (data.type === 'addMember' && onAddMember) {
        onAddMember();
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  if (!treeData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading family tree...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
                   <WebView
        source={{ html: generateHTML(treeData, familyMembers ? familyMembers.filter(member => 
          member.relationship.toLowerCase().includes('father') || 
          member.relationship.toLowerCase().includes('mother') ||
          member.relationship.toLowerCase().includes('wife')
        ) : []) }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
}); 