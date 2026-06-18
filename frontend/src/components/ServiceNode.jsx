import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Compass, Server, Database, Globe, Layers } from 'lucide-react';

const ServiceNode = ({ data, isConnectable }) => {
  const label = data.label || 'Service Node';
  const tech = data.tech || '';
  const desc = data.description || '';

  // Return icons based on node labels
  const getIcon = () => {
    const l = label.toLowerCase();
    if (l.includes('client') || l.includes('frontend') || l.includes('app')) {
      return <Globe className="w-5 h-5 text-accent-cyan" />;
    }
    if (l.includes('gateway') || l.includes('proxy')) {
      return <Compass className="w-5 h-5 text-accent-purple" />;
    }
    if (l.includes('db') || l.includes('database') || l.includes('postgres') || l.includes('mongo')) {
      return <Database className="w-5 h-5 text-accent-pink" />;
    }
    return <Server className="w-5 h-5 text-indigo-400" />;
  };

  const getBorderColorClass = () => {
    const l = label.toLowerCase();
    if (l.includes('client') || l.includes('frontend') || l.includes('app')) {
      return 'border-accent-cyan/35 shadow-glow-cyan';
    }
    if (l.includes('gateway') || l.includes('proxy')) {
      return 'border-accent-purple/35 shadow-glow-purple';
    }
    if (l.includes('db') || l.includes('database')) {
      return 'border-accent-pink/35 shadow-glow-pink';
    }
    return 'border-indigo-500/35';
  };

  return (
    <div className={`glass p-4 rounded-xl border ${getBorderColorClass()} min-w-[180px]`}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      
      <div className="flex items-center gap-3 mb-2">
        <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
          {getIcon()}
        </div>
        <div>
          <h4 className="text-white font-bold text-xs">{label}</h4>
          {tech && <span className="text-[10px] text-slate-500 font-mono">{tech}</span>}
        </div>
      </div>

      {desc && <p className="text-slate-400 text-[10px] leading-relaxed border-t border-white/5 pt-1.5">{desc}</p>}

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

export default memo(ServiceNode);
