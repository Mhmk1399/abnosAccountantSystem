"use client";

import { WorkflowData, WorkflowStep } from "@/types/finalTypes";
import { useState } from "react";

interface DescriptionMakerProps {
  workflow: WorkflowData;
  value: string;
  onChange: (value: string) => void;
}

const DescriptionMaker = ({ workflow, value, onChange }: DescriptionMakerProps) => {
  const [description, setDescription] = useState(value || "");

  // Get available fields from workflow models
  const getAvailableFields = () => {
    const fields: string[] = [];
    
    // Add request fields
    fields.push("request.amount", "request.checkNumber", "request.senderName", "request.receiverName", "request.description");
    
    // Add step fields
    workflow.steps.forEach((step: WorkflowStep) => {
      if (step.model === "CheckTransaction") {
        fields.push(`step.${step.action}.checkNumber`, `step.${step.action}.senderName`, `step.${step.action}.amount`);
      }
      if (step.model === "Transaction") {
        fields.push(`step.${step.action}._id`, `step.${step.action}.amount`);
      }
    });
    
    return fields;
  };

  const handleDragStart = (e: React.DragEvent, field: string) => {
    e.dataTransfer.setData("text/plain", `{${field}}`);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fieldTag = e.dataTransfer.getData("text/plain");
    const textarea = e.target as HTMLTextAreaElement;
    const cursorPos = textarea.selectionStart;
    const newValue = description.slice(0, cursorPos) + fieldTag + description.slice(cursorPos);
    setDescription(newValue);
    onChange(newValue);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const insertField = (field: string) => {
    const fieldTag = `{${field}}`;
    setDescription(prev => prev + fieldTag);
    onChange(description + fieldTag);
  };

  return (
    <div className="space-y-4">
      <h4 className="font-semibold">سازنده توضیحات</h4>
      
      {/* Available Fields */}
      <div>
        <label className="block text-sm font-medium mb-2">فیلدهای موجود (بکشید و رها کنید):</label>
        <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded border min-h-[60px]">
          {getAvailableFields().map(field => (
            <div
              key={field}
              draggable
              onDragStart={(e) => handleDragStart(e, field)}
              onClick={() => insertField(field)}
              className="bg-blue-500 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-blue-600"
            >
              {field}
            </div>
          ))}
        </div>
      </div>

      {/* Description Input */}
      <div>
        <label className="block text-sm font-medium mb-2">متن توضیحات:</label>
        <textarea
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onChange(e.target.value);
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full p-3 border rounded h-24 resize-none"
          placeholder="متن خود را بنویسید یا فیلدها را بکشید و رها کنید..."
        />
      </div>

      {/* Preview */}
      <div>
        <label className="block text-sm font-medium mb-2">پیش‌نمایش:</label>
        <div className="p-3 bg-gray-50 border rounded text-sm">
          {description || "پیش‌نمایش توضیحات اینجا نمایش داده می‌شود"}
        </div>
      </div>
    </div>
  );
};

export default DescriptionMaker;