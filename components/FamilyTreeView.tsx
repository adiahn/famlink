import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Colors } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthYear: string;
  isDeceased: boolean;
  deathYear?: string;
  isVerified: boolean;
  isFamilyCreator: boolean;
  joinId: string;
  avatarUrl?: string;
  gender?: 'male' | 'female';
  spouse?: string;
  children?: string[];
}

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
}

interface FamilyTreeViewProps {
  familyMembers: FamilyMember[];
  onMemberSelect?: (memberId: string) => void;
}

export default function FamilyTreeView({ familyMembers, onMemberSelect }: FamilyTreeViewProps) {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);

  // Find parents for the HTML generation (including mothers as potential wives)
  const parents = familyMembers ? familyMembers.filter(member => 
    member.relationship.toLowerCase().includes('father') || 
    member.relationship.toLowerCase().includes('mother') ||
    member.relationship.toLowerCase().includes('wife')
  ) : [];

  useEffect(() => {
    console.log('FamilyTreeView received members:', familyMembers);
    if (familyMembers && familyMembers.length > 0) {
      const tree = buildFamilyTree(familyMembers);
      console.log('Built tree data:', tree);
      setTreeData(tree);
    } else {
      setTreeData(null);
    }
  }, [familyMembers]);

  const buildFamilyTree = (members: FamilyMember[]): TreeNode => {
    console.log('Building tree with members:', members);
    
    if (!members || members.length === 0) {
      return {
        id: 'root',
        name: 'Family',
        gender: 'male',
        birthYear: '',
        isDeceased: false,
        children: []
      };
    }
    
    // Validate members have required properties
    const validMembers = members.filter(member => 
      member && 
      member.id && 
      member.name && 
      member.relationship && 
      member.birthYear
    );
    
    if (validMembers.length === 0) {
      return {
        id: 'root',
        name: 'Family',
        gender: 'male',
        birthYear: '',
        isDeceased: false,
        children: []
      };
    }
    
    // Create a map for quick lookup
    const memberMap = new Map<string, FamilyMember>();
    validMembers.forEach(member => memberMap.set(member.id, member));

    // Find parents (father, mother, and wives)
    const parents = validMembers.filter(member => 
      member.relationship.toLowerCase().includes('father') || 
      member.relationship.toLowerCase().includes('mother') ||
      member.relationship.toLowerCase().includes('wife')
    );

    // Find children (siblings, sons, daughters)
    const children = validMembers.filter(member => 
      member.relationship.toLowerCase().includes('brother') || 
      member.relationship.toLowerCase().includes('sister') ||
      member.relationship.toLowerCase().includes('son') ||
      member.relationship.toLowerCase().includes('daughter') ||
      member.relationship.toLowerCase().includes('child') ||
      member.relationship === 'Creator'
    );

    console.log('Parents found:', parents);
    console.log('Children found:', children);

    // Create parent nodes
    const parentNodes: TreeNode[] = parents.map(parent => ({
      id: parent.id,
      name: parent.name,
      gender: (parent.gender || (parent.relationship.toLowerCase().includes('father') ? 'male' : 'female')) as 'male' | 'female',
      birthYear: parent.birthYear,
      isDeceased: parent.isDeceased,
      deathYear: parent.deathYear,
      children: []
    }));

    // Create child nodes
    const childNodes: TreeNode[] = children.map(child => ({
      id: child.id,
      name: child.name,
      gender: (child.gender || (child.relationship.toLowerCase().includes('brother') || 
                              child.relationship.toLowerCase().includes('son') ? 'male' : 'female')) as 'male' | 'female',
      birthYear: child.birthYear,
      isDeceased: child.isDeceased,
      deathYear: child.deathYear,
      children: []
    }));

    // If we have parents, create a proper hierarchical structure
    if (parents.length > 0) {
      // Create a family couple node that contains both parents
      const familyCoupleNode: TreeNode = {
        id: 'family-couple',
        name: 'Parents',
        gender: 'male',
        birthYear: '',
        isDeceased: false,
        children: childNodes // Children are directly under the couple
      };

      // Create a root node with the family couple as the main child
      const rootNode: TreeNode = {
        id: 'root',
        name: 'Family',
        gender: 'male',
        birthYear: '',
        isDeceased: false,
        children: [familyCoupleNode]
      };

      return rootNode;
    }

    // Fallback: if no parents, show all members at same level
    const allMembers = validMembers.map(member => ({
      id: member.id,
      name: member.name,
      gender: member.gender || (member.relationship.toLowerCase().includes('father') || 
                               member.relationship.toLowerCase().includes('brother') || 
                               member.relationship.toLowerCase().includes('son') ? 'male' : 'female'),
      birthYear: member.birthYear,
      isDeceased: member.isDeceased,
      deathYear: member.deathYear,
      children: []
    }));

    return {
      id: 'root',
      name: 'Family',
      gender: 'male',
      birthYear: '',
      isDeceased: false,
      children: allMembers
    };
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
            fill: white;
            stroke: #e2e8f0;
            stroke-width: 2;
            rx: 8;
            ry: 8;
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
          }
          
          .node-card.male {
            stroke: #3b82f6;
          }
          
          .node-card.female {
            stroke: #f59e0b;
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
            font-size: 12px;
            font-weight: 600;
            fill: #1f2937;
            text-anchor: middle;
          }
          
          .year-text {
            font-size: 10px;
            fill: #6b7280;
            text-anchor: middle;
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
        </style>
      </head>
      <body>
        <div class="tree-container">
          <div class="zoom-controls">
            <button class="zoom-btn" onclick="zoomIn()">+</button>
            <button class="zoom-btn" onclick="zoomOut()">-</button>
            <button class="zoom-btn" onclick="resetZoom()">⌂</button>
          </div>
          <div id="tree"></div>
        </div>
        
                 <script>
           const data = ${JSON.stringify(data)};
           const parents = ${JSON.stringify(parents)};
           let currentZoom = 1;
           let selectedNode = null;
          
                     // Set up the tree layout
           const margin = { top: 50, right: 50, bottom: 50, left: 50 };
           const containerWidth = window.innerWidth - margin.left - margin.right;
           const containerHeight = window.innerHeight - margin.top - margin.bottom;
           
           // Create the hierarchy
           const root = d3.hierarchy(data);
           
           // If we have multiple children at the root level, arrange them horizontally
           if (root.children && root.children.length > 1) {
             // Use a cluster layout for better horizontal arrangement
             const cluster = d3.cluster()
               .size([containerWidth, containerHeight])
               .nodeSize([120, 200]);
             cluster(root);
           } else {
             // Use tree layout for hierarchical structure
             const tree = d3.tree()
               .size([containerWidth, containerHeight])
               .nodeSize([120, 200]);
             tree(root);
           }
          
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
          
                     // Find the family couple node and create parent cards within it
           const familyCoupleNode = root.descendants().find(d => d.data.id === 'family-couple');
           
                       if (familyCoupleNode && parents.length > 0) {
              console.log('Drawing parents:', parents);
              // Calculate positions for parents within the couple node
              const coupleX = familyCoupleNode.x;
              const coupleY = familyCoupleNode.y;
              const parentSpacing = 120; // Space between parents
              
              // Sort parents: Father first, then mothers/wives in order
              const father = parents.find(p => p.relationship.toLowerCase().includes('father'));
              const wives = parents.filter(p => 
                p.relationship.toLowerCase().includes('wife') || 
                p.relationship.toLowerCase().includes('mother')
              ).sort((a, b) => {
                // If it's a numbered wife, sort by number, otherwise treat as mother
                const aNum = parseInt(a.relationship.match(/\\d+/)?.[0] || '0');
                const bNum = parseInt(b.relationship.match(/\\d+/)?.[0] || '0');
                if (aNum > 0 && bNum > 0) {
                  return aNum - bNum;
                }
                // Mothers come before numbered wives
                if (a.relationship.toLowerCase().includes('mother') && !b.relationship.toLowerCase().includes('mother')) {
                  return -1;
                }
                if (b.relationship.toLowerCase().includes('mother') && !a.relationship.toLowerCase().includes('mother')) {
                  return 1;
                }
                return 0;
              });
              
              console.log('Father:', father);
              console.log('Wives:', wives);
              
              const allParents = [father, ...wives].filter(Boolean);
              const totalWidth = (allParents.length - 1) * parentSpacing;
              const startX = coupleX - totalWidth / 2;
              
              // Draw all parents
              allParents.forEach((parent, index) => {
                const parentX = startX + index * parentSpacing;
                const parentY = coupleY;
                
                // Determine gender and card style
                const isMale = parent.relationship.toLowerCase().includes('father');
                const cardClass = isMale ? 'male' : 'female';
                const iconClass = isMale ? 'male' : 'female';
                
                // Draw parent card
                g.append("rect")
                  .attr("class", \`node-card \${cardClass}\`)
                  .attr("x", parentX - 50)
                  .attr("y", parentY - 30)
                  .attr("width", 100)
                  .attr("height", 60);
                
                // Draw gender icon
                g.append("circle")
                  .attr("class", \`gender-icon \${iconClass}\`)
                  .attr("cx", parentX)
                  .attr("cy", parentY - 15)
                  .attr("r", 8);
                
                // Draw name
                g.append("text")
                  .attr("class", "name-text")
                  .attr("x", parentX)
                  .attr("y", parentY + 5)
                  .text(parent.name.length > 12 ? parent.name.substring(0, 12) + '...' : parent.name);
                
                // Draw years
                g.append("text")
                  .attr("class", "year-text")
                  .attr("x", parentX)
                  .attr("y", parentY + 20)
                  .text(parent.birthYear);
              });
              
              // Draw marriage lines between consecutive parents
              for (let i = 0; i < allParents.length - 1; i++) {
                const currentX = startX + i * parentSpacing;
                const nextX = startX + (i + 1) * parentSpacing;
                
                g.append("path")
                  .attr("class", "marriage-line")
                  .attr("d", \`M\${currentX},\${coupleY} L\${nextX},\${coupleY}\`);
                
                // Add marriage symbol in the middle
                const midX = (currentX + nextX) / 2;
                
                g.append("ellipse")
                  .attr("class", "marriage-symbol")
                  .attr("cx", midX)
                  .attr("cy", coupleY - 10)
                  .attr("rx", 8)
                  .attr("ry", 4);
              }
            }
          
          
          
                     // Create node groups (skip the family couple node since we draw parents manually)
           const nodes = g.selectAll(".node")
             .data(root.descendants().filter(d => d.data.id !== 'family-couple'))
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
          
          // Draw node cards
          nodes.append("rect")
            .attr("class", d => \`node-card \${d.data.gender}\`)
            .attr("x", -50)
            .attr("y", -30)
            .attr("width", 100)
            .attr("height", 60);
          
          // Draw gender icons
          nodes.append("circle")
            .attr("class", d => \`gender-icon \${d.data.gender}\`)
            .attr("cx", 0)
            .attr("cy", -15)
            .attr("r", 8);
          
          // Draw names
          nodes.append("text")
            .attr("class", "name-text")
            .attr("y", 5)
            .text(d => d.data.name.length > 12 ? d.data.name.substring(0, 12) + '...' : d.data.name);
          
          // Draw years
          nodes.append("text")
            .attr("class", "year-text")
            .attr("y", 20)
            .text(d => {
              let text = d.data.birthYear;
              if (d.data.isDeceased && d.data.deathYear) {
                text += ' - ' + d.data.deathYear;
              }
              return text;
            });
          
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
        source={{ html: generateHTML(treeData, parents || []) }}
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