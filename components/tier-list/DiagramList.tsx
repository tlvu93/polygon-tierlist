"use client";

interface Diagram {
  id: string;
  name: string;
  propertyCount: number;
  thumbnail?: string;
}

interface DiagramListProps {
  diagrams: Diagram[];
  currentDiagramId: string;
  onDiagramSelect: (id: string) => void;
}

export default function DiagramList({ diagrams, currentDiagramId, onDiagramSelect }: DiagramListProps) {
  return (
    <div className="w-[20%] min-w-[200px] border-l border-r bg-slate-50 overflow-auto">
      <div className="p-3">
        <h3 className="text-sm font-medium mb-2">Diagrams</h3>
        <div className="space-y-2">
          {diagrams.map((diagram) => (
            <div
              key={diagram.id}
              onClick={() => onDiagramSelect(diagram.id)}
              className={`
                p-2 rounded cursor-pointer transition-colors
                ${diagram.id === currentDiagramId ? "bg-slate-200" : "hover:bg-slate-100"}
              `}
            >
              <div className="flex items-center gap-2">
                {diagram.thumbnail && (
                  <div className="w-8 h-8 bg-slate-300 rounded flex-shrink-0">
                    <img src={diagram.thumbnail} alt={diagram.name} className="w-full h-full object-cover rounded" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{diagram.name}</div>
                  <div className="text-xs text-slate-500">{diagram.propertyCount} properties</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
