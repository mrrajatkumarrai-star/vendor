import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { VendorCard } from './VendorCard';
import type { Vendor } from '@/types/vendor';

export interface VendorNodeData {
  vendor: Vendor;
}

export const VendorNode = memo(function VendorNode({ data }: NodeProps<VendorNodeData>) {
  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-1.5 !h-1.5 !bg-border !border-none"
      />
      <VendorCard vendor={data.vendor} compact />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1.5 !h-1.5 !bg-border !border-none"
      />
    </div>
  );
});

// Group node for countries/states/cities
export interface GroupNodeData {
  label: string;
  count: number;
  level: 'country' | 'state' | 'city';
}

export const GroupNode = memo(function GroupNode({ data }: NodeProps<GroupNodeData>) {
  const bgColors = {
    country: 'bg-blue-50 border-blue-200 text-blue-800',
    state: 'bg-purple-50 border-purple-200 text-purple-800',
    city: 'bg-teal-50 border-teal-200 text-teal-800',
  };

  return (
    <div className="relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!w-1.5 !h-1.5 !bg-border !border-none"
      />
      <div className={`px-3 py-1.5 rounded border shadow-subtle ${bgColors[data.level]}`}>
        <div className="text-xs font-semibold">{data.label}</div>
        <div className="text-2xs opacity-70">{data.count} vendors</div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-1.5 !h-1.5 !bg-border !border-none"
      />
    </div>
  );
});
