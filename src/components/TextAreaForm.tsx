"use client";

import { useState } from "react";

interface TextAreaFormProps {
  initialValue: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  buttonText: string;
  rows?: number;
}

export default function TextAreaForm({
  initialValue,
  onSave,
  placeholder,
  buttonText,
  rows = 10,
}: TextAreaFormProps) {
  const [value, setValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(value);
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full p-2 border rounded-lg text-gray-900"
        rows={rows}
        placeholder={placeholder}
      />
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        disabled={isSaving}
      >
        {isSaving ? "Salvando..." : buttonText}
      </button>
    </form>
  );
}
