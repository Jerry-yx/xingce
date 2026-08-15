import React, { useState } from 'react';
import { Card, Tag } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';

interface ModuleCardProps {
  title: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function ModuleCard({ title, children, headerExtra, collapsible = false, defaultCollapsed = false }: ModuleCardProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const toggleIcon = collapsible ? (
    <span
      style={{ cursor: 'pointer', marginRight: 8, transition: 'transform 0.2s', transform: collapsed ? 'rotate(0deg)' : 'rotate(90deg)', display: 'inline-block' }}
      onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
    >
      <CaretRightOutlined style={{ fontSize: 12, color: '#1a2b4c' }} />
    </span>
  ) : null;

  return (
    <Card
      title={
        <span
          style={{ fontSize: 16, fontWeight: 600, color: '#1a2b4c', cursor: collapsible ? 'pointer' : 'default', userSelect: 'none' }}
          onClick={collapsible ? () => setCollapsed(!collapsed) : undefined}
        >
          {toggleIcon}
          {title}
        </span>
      }
      extra={headerExtra}
      style={{ marginBottom: 16, borderRadius: 12 }}
      headStyle={{ borderBottom: collapsed ? '2px solid #e2e8f0' : '2px solid #e2e8f0' }}
    >
      {!collapsed && children}
    </Card>
  );
}

export function AccuracyBadge({ correct, total }: { correct: number; total: number }) {
  if (total <= 0) return null;
  const rate = Math.round((correct / total) * 100);
  const color = rate >= 80 ? '#52c41a' : rate >= 60 ? '#faad14' : '#ff4d4f';
  return (
    <Tag color={color} style={{ fontSize: 13, fontWeight: 600 }}>
      正确率 {rate}%
    </Tag>
  );
}