'use client';

import { roles } from '@/constants/roles';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div>
      <label className="block mb-1 font-medium">選擇角色風格</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label} - {role.description}
          </option>
        ))}
      </select>
    </div>
  );
}
