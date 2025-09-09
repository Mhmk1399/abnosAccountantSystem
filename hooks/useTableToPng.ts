import { useCallback, useState } from "react";
import html2canvas from "html2canvas";

interface TableToPngOptions {
  filename?: string;
  backgroundColor?: string;
  scale?: number;
  useCORS?: boolean;
  allowTaint?: boolean;
  width?: number;
  height?: number;
}

type TableRowData = Record<
  string,
  string | number | boolean | null | undefined
>;

interface UseTableToPngReturn {
  generateRowPng: (
    rowData: TableRowData,
    headers: string[],
    options?: TableToPngOptions
  ) => Promise<void>;
  generateTablePng: (
    data: TableRowData[],
    headers: string[],
    options?: TableToPngOptions
  ) => Promise<void>;
  generateSelectedRowsPng: (
    selectedData: TableRowData[],
    headers: string[],
    options?: TableToPngOptions
  ) => Promise<void>;
  isGenerating: boolean;
  error: string | null;
}

export const useTableToPng = (): UseTableToPngReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSelectedRowsPng = useCallback(
    async (
      selectedData: TableRowData[],
      headers: string[],
      options: TableToPngOptions = {}
    ) => {
      setIsGenerating(true);
      setError(null);

      try {
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "-9999px";
        tempDiv.style.backgroundColor = options.backgroundColor || "#ffffff";
        tempDiv.style.padding = "20px";
        tempDiv.style.fontFamily = "Arial, sans-serif";
        tempDiv.style.direction = "rtl";

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.border = "2px solid #333";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headerRow.style.backgroundColor = "#f8f9fa";

        headers.forEach((header) => {
          const th = document.createElement("th");
          th.textContent = header;
          th.style.border = "1px solid #ddd";
          th.style.padding = "12px";
          th.style.textAlign = "right";
          th.style.fontWeight = "bold";
          th.style.fontSize = "14px";
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        selectedData.forEach((row, index) => {
          const dataRow = document.createElement("tr");
          dataRow.style.backgroundColor =
            index % 2 === 0 ? "#ffffff" : "#f8f9fa";

          Object.values(row).forEach(
            (value: string | number | boolean | null | undefined) => {
              const td = document.createElement("td");
              td.textContent = value?.toString() || "-";
              td.style.border = "1px solid #ddd";
              td.style.padding = "12px";
              td.style.textAlign = "right";
              td.style.fontSize = "13px";
              dataRow.appendChild(td);
            }
          );
          tbody.appendChild(dataRow);
        });
        table.appendChild(tbody);

        tempDiv.appendChild(table);
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          background: options.backgroundColor || "#ffffff",
          // scale: options.scale || 2,
          useCORS: options.useCORS || true,
          allowTaint: options.allowTaint || false,
        });

        document.body.removeChild(tempDiv);

        const link = document.createElement("a");
        link.download = options.filename || `selected-rows-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در ساخت عکس");
        console.error("Error generating selected rows PNG:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const generateRowPng = useCallback(
    async (
      rowData: TableRowData,
      headers: string[],
      options: TableToPngOptions = {}
    ) => {
      setIsGenerating(true);
      setError(null);

      try {
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "-9999px";
        tempDiv.style.backgroundColor = options.backgroundColor || "#ffffff";
        tempDiv.style.padding = "20px";
        tempDiv.style.fontFamily = "Arial, sans-serif";
        tempDiv.style.direction = "rtl";

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.border = "2px solid #333";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headerRow.style.backgroundColor = "#f8f9fa";
        headers.forEach((header) => {
          const th = document.createElement("th");
          th.textContent = header;
          th.style.border = "1px solid #ddd";
          th.style.padding = "12px";
          th.style.textAlign = "right";
          th.style.fontWeight = "bold";
          th.style.fontSize = "14px";
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        const dataRow = document.createElement("tr");
        dataRow.style.backgroundColor = "#ffffff";

        Object.values(rowData).forEach(
          (value: string | number | boolean | null | undefined) => {
            const td = document.createElement("td");
            td.textContent = value?.toString() || "-";
            td.style.border = "1px solid #ddd";
            td.style.padding = "12px";
            td.style.textAlign = "right";
            td.style.fontSize = "13px";
            dataRow.appendChild(td);
          }
        );
        tbody.appendChild(dataRow);
        table.appendChild(tbody);

        tempDiv.appendChild(table);
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          background: options.backgroundColor || "#ffffff",
          // scale: options.scale || 2,
          useCORS: options.useCORS || true,
          allowTaint: options.allowTaint || false,
        });

        document.body.removeChild(tempDiv);

        const link = document.createElement("a");
        link.download = options.filename || `row-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در ساخت عکس");
        console.error("Error generating row PNG:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const generateTablePng = useCallback(
    async (
      data: TableRowData[],
      headers: string[],
      options: TableToPngOptions = {}
    ) => {
      setIsGenerating(true);
      setError(null);

      try {
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "-9999px";
        tempDiv.style.backgroundColor = options.backgroundColor || "#ffffff";
        tempDiv.style.padding = "20px";
        tempDiv.style.fontFamily = "Arial, sans-serif";
        tempDiv.style.direction = "rtl";

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.border = "2px solid #333";

        const thead = document.createElement("thead");
        const headerRow = document.createElement("tr");
        headerRow.style.backgroundColor = "#f8f9fa";

        headers.forEach((header) => {
          const th = document.createElement("th");
          th.textContent = header;
          th.style.border = "1px solid #ddd";
          th.style.padding = "12px";
          th.style.textAlign = "right";
          th.style.fontWeight = "bold";
          th.style.fontSize = "14px";
          headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement("tbody");
        data.forEach((row, index) => {
          const dataRow = document.createElement("tr");
          dataRow.style.backgroundColor =
            index % 2 === 0 ? "#ffffff" : "#f8f9fa";

          Object.values(row).forEach(
            (value: string | number | boolean | null | undefined) => {
              const td = document.createElement("td");
              td.textContent = value?.toString() || "-";
              td.style.border = "1px solid #ddd";
              td.style.padding = "12px";
              td.style.textAlign = "right";
              td.style.fontSize = "13px";
              dataRow.appendChild(td);
            }
          );
          tbody.appendChild(dataRow);
        });
        table.appendChild(tbody);

        tempDiv.appendChild(table);
        document.body.appendChild(tempDiv);

        const canvas = await html2canvas(tempDiv, {
          background: options.backgroundColor || "#ffffff",
          // scale: options.scale || 2,
          useCORS: options.useCORS || true,
          allowTaint: options.allowTaint || false,
        });

        document.body.removeChild(tempDiv);

        const link = document.createElement("a");
        link.download = options.filename || `table-${Date.now()}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطا در ساخت عکس");
        console.error("Error generating table PNG:", err);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  return {
    generateRowPng,
    generateTablePng,
    generateSelectedRowsPng,
    isGenerating,
    error,
  };
};
