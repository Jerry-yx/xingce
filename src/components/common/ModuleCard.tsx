import React from 'react';
import { Card, Tag } from 'antd';

interface ModuleCardProps {
  title: string;
  children: React.ReactNode;
  headerExtra?: React.ReactNode;
}

export function ModuleCard({ title, children, headerExtra }: ModuleCardProps) {
  return (
    <Card
      title={
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1a2b4c' }}>
          {title}
        </span>
      }
      extra={headerExtra}
      style={{ marginBottom: 16, borderRadius: 12 }}
      headStyle={{ borderBottom: '2px solid #e2e8f0' }}
    >
      {children}
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