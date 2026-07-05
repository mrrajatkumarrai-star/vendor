import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { VendorNode, GroupNode, type VendorNodeData, type GroupNodeData } from './VendorNode';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Vendor } from '@/types/vendor';
import { Map } from 'lucide-react';

const nodeTypes = {
  vendor: VendorNode,
  group: GroupNode,
};

interface MindMapViewProps {
  vendors: Vendor[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function MindMapView({ vendors, isLoading }: MindMapViewProps) {
  const { initialNodes, initialEdges } = useMemo(() => {
    if (vendors.length === 0) return { initialNodes: [], initialEdges: [] };

    const nodes: Node<VendorNodeData | GroupNodeData>[] = [];
    const edges: Edge[] = [];

    // Root node
    nodes.push({
      id: 'root',
      type: 'group',
      position: { x: 0, y: 0 },
      data: { label: 'All Vendors', count: vendors.length, level: 'country' as const },
    });

    // Group vendors by country → city
    const countryMap = new Map<string, Vendor[]>();
    vendors.forEach((v) => {
      const country = v.country || 'Unknown';
      if (!countryMap.has(country)) countryMap.set(country, []);
      countryMap.get(country)!.push(v);
    });

    let countryX = 0;
    const COUNTRY_GAP = 400;
    const CITY_GAP = 320;
    const VENDOR_GAP = 290;
    const Y_COUNTRY = 120;
    const Y_CITY = 260;
    const Y_VENDOR = 400;

    countryMap.forEach((countryVendors, country) => {
      const countryId = `country-${country}`;
      nodes.push({
        id: countryId,
        type: 'group',
        position: { x: countryX, y: Y_COUNTRY },
        data: { label: country, count: countryVendors.length, level: 'country' as const },
      });
      edges.push({
        id: `root-${countryId}`,
        source: 'root',
        target: countryId,
        type: 'smoothstep',
        style: { stroke: '#E5E7EB', strokeWidth: 1 },
      });

      // Group by city within country
      const cityMap = new Map<string, Vendor[]>();
      countryVendors.forEach((v) => {
        const city = v.city || 'Other';
        if (!cityMap.has(city)) cityMap.set(city, []);
        cityMap.get(city)!.push(v);
      });

      let cityX = countryX - ((cityMap.size - 1) * CITY_GAP) / 2;

      cityMap.forEach((cityVendors, city) => {
        const cityId = `city-${country}-${city}`;
        nodes.push({
          id: cityId,
          type: 'group',
          position: { x: cityX, y: Y_CITY },
          data: { label: city, count: cityVendors.length, level: 'city' as const },
        });
        edges.push({
          id: `${countryId}-${cityId}`,
          source: countryId,
          target: cityId,
          type: 'smoothstep',
          style: { stroke: '#E5E7EB', strokeWidth: 1 },
        });

        // Place vendors under city (limit to first 20 per city for performance)
        const displayVendors = cityVendors.slice(0, 20);
        let vendorX = cityX - ((displayVendors.length - 1) * VENDOR_GAP) / 2;

        displayVendors.forEach((vendor) => {
          const vendorNodeId = `vendor-${vendor.id}`;
          nodes.push({
            id: vendorNodeId,
            type: 'vendor',
            position: { x: vendorX, y: Y_VENDOR },
            data: { vendor },
          });
          edges.push({
            id: `${cityId}-${vendorNodeId}`,
            source: cityId,
            target: vendorNodeId,
            type: 'smoothstep',
            style: { stroke: '#E5E7EB', strokeWidth: 1 },
          });
          vendorX += VENDOR_GAP;
        });

        cityX += CITY_GAP;
      });

      countryX += Math.max(cityMap.size * CITY_GAP, COUNTRY_GAP);
    });

    return { initialNodes: nodes, initialEdges: edges };
  }, [vendors]);

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edgesState, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeDragStop = useCallback(() => {
    // Nodes are draggable by default — position is persisted in local state
  }, []);

  if (isLoading && vendors.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" label="Loading vendors..." />
      </div>
    );
  }

  if (vendors.length === 0) {
    return (
      <EmptyState
        icon={<Map className="w-10 h-10" />}
        title="No vendors found"
        description="Add your first vendor or adjust your filters."
        className="h-full"
      />
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edgesState}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.05}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.5 }}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          showInteractive={false}
          className="!shadow-subtle !border !border-border"
        />
        <MiniMap
          nodeStrokeColor="#E5E7EB"
          nodeColor="#F9FAFB"
          nodeBorderRadius={4}
          className="!shadow-subtle"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E7EB" />
      </ReactFlow>
    </div>
  );
}
