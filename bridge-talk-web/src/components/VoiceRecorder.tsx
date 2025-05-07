'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { roles } from '@/constants/roles';

export default function VoiceRecorder() {
  const [selectedRole, setSelectedRole] = useState('bestie');

  return (
    <Card className="w-full max-w-xl mx-auto mt-10 shadow-lg rounded-2xl border">
      <CardContent className="space-y-6 p-6">
        <div className="space-y-2">
          <Label className="text-lg font-bold">請選擇角色風格</Label>
          <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value)}>
            <SelectTrigger className="w-full h-12 rounded-lg border px-4">
              <SelectValue placeholder="選擇角色" />
            </SelectTrigger>
            <SelectContent className="bg-white max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  <div className="space-y-1">
                    <div className="text-base font-semibold">{role.label}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 可在此加入錄音元件或其他操作欄位 */}
        <div className="text-sm text-gray-500">（這裡可以接著加入錄音、語氣強度、email 等欄位）</div>
      </CardContent>
    </Card>
  );
}
