import React, { useRef, useState } from 'react';

export default function DraggableWindow({
  initialPosition = { x: 100, y: 100 },
  zIndex = 10,
  width = 420,
  height = 520,
  onClick,
  children,
}) {
  const [position, setPosition] = useState(initialPosition);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    // Only drag if the target or its parent has data-drag-handle
    let el = e.target;
    let found = false;
    while (el && el !== e.currentTarget) {
      if (el.dataset && el.dataset.dragHandle !== undefined) {
        found = true;
        break;
      }
      el = el.parentElement;
    }
    if (!found) return;
    dragging.current = true;
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (!dragging.current) return;
    setPosition({
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const onMouseUp = () => {
    dragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex,
        width,
        height,
        cursor: dragging.current ? 'grabbing' : 'default',
        userSelect: dragging.current ? 'none' : undefined,
        background: 'transparent',
      }}
      className="transition-shadow"
      onMouseDown={onClick}
    >
      <div onMouseDown={onMouseDown} style={{ cursor: 'grab', width: '100%', height: '100%' }}>
        {children}
      </div>
    </div>
  );
} 