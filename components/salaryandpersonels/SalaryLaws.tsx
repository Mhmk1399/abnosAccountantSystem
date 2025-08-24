"use client";

import React, { useState, useEffect } from "react";

interface SalaryLawsData {
  _id?: string;
  year: number;
  workHoursPerDay: number;
  baseSalary: number;
  housingAllowance: number;
  workerVoucher: number;
  childAllowance1: number;
  childAllowance2: number;
  seniorityPay: number;
  overtimeRate: number;
  holidayRate: number;
  taxRate: number;
  insuranceRate: number;
}

const SalaryLaws: React.FC = () => {
  const [formData, setFormData] = useState<SalaryLawsData>({
    year: 1403,
    workHoursPerDay: 7.33,
    baseSalary: 5000000,
    housingAllowance: 500000,
    workerVoucher: 300000,
    childAllowance1: 200000,
    childAllowance2: 400000,
    seniorityPay: 100000,
    overtimeRate: 50000,
    holidayRate: 60000,
    taxRate: 0.1,
    insuranceRate: 0.07,
  });
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState<SalaryLawsData[]>([]);

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const response = await fetch("/api/salaryandpersonels/salaryLaws");
      const result = await response.json();
      if (response.ok) {
        setYears(result.salaryLaws || []);
      }
    } catch (error) {
      console.error("Error fetching years:", error);
    }
  };

  const loadYear = async (year: number) => {
    try {
      const response = await fetch("/api/salaryandpersonels/salaryLaws", {
        headers: { year: year.toString() },
      });
      const result = await response.json();
      if (response.ok && result.salaryLaws) {
        setFormData(result.salaryLaws);
      }
    } catch (error) {
      console.error("Error loading year:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const method = formData._id ? "PATCH" : "POST";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (formData._id) headers.id = formData._id;

      const response = await fetch("/api/salaryandpersonels/salaryLaws", {
        method,
        headers,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("قوانین حقوق با موفقیت ذخیره شد");
        fetchYears();
      } else {
        const result = await response.json();
        alert("خطا: " + result.error);
      }
    } catch (error) {
      console.log(error);

      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof SalaryLawsData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">قوانین حقوق</h2>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            انتخاب سال موجود
          </label>
          <select
            onChange={(e) => e.target.value && loadYear(Number(e.target.value))}
            className="border rounded px-3 py-2 w-48"
          >
            <option value="">سال جدید</option>
            {years.map((item) => (
              <option key={item._id} value={item.year}>
                {item.year}
              </option>
            ))}
          </select>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">سال</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange("year", Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              ساعت کار روزانه
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.workHoursPerDay}
              onChange={(e) =>
                handleChange("workHoursPerDay", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">حقوق پایه</label>
            <input
              type="number"
              value={formData.baseSalary}
              onChange={(e) =>
                handleChange("baseSalary", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              کمک هزینه مسکن
            </label>
            <input
              type="number"
              value={formData.housingAllowance}
              onChange={(e) =>
                handleChange("housingAllowance", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">بن کارگری</label>
            <input
              type="number"
              value={formData.workerVoucher}
              onChange={(e) =>
                handleChange("workerVoucher", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              کمک هزینه فرزند اول
            </label>
            <input
              type="number"
              value={formData.childAllowance1}
              onChange={(e) =>
                handleChange("childAllowance1", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              کمک هزینه فرزند دوم
            </label>
            <input
              type="number"
              value={formData.childAllowance2}
              onChange={(e) =>
                handleChange("childAllowance2", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">سنوات</label>
            <input
              type="number"
              value={formData.seniorityPay}
              onChange={(e) =>
                handleChange("seniorityPay", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              نرخ اضافه کار
            </label>
            <input
              type="number"
              value={formData.overtimeRate}
              onChange={(e) =>
                handleChange("overtimeRate", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              نرخ کار تعطیل
            </label>
            <input
              type="number"
              value={formData.holidayRate}
              onChange={(e) =>
                handleChange("holidayRate", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نرخ مالیات</label>
            <input
              type="number"
              step="0.01"
              value={formData.taxRate}
              onChange={(e) => handleChange("taxRate", Number(e.target.value))}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">نرخ بیمه</label>
            <input
              type="number"
              step="0.01"
              value={formData.insuranceRate}
              onChange={(e) =>
                handleChange("insuranceRate", Number(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "در حال ذخیره..." : "ذخیره قوانین"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SalaryLaws;
