"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ShortTermSummary({ modelResult }: any) {
  const meta = modelResult.meta || {};
  const dailyTotals = modelResult.daily_totals || [];
  const topTransects = modelResult.top_transects || [];
  const bottomTransects = modelResult.bottom_transects || [];

  return (
    <div className="space-y-8 mt-6">
      {/* Meta Info */}
      <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">📘 Model Metadata</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700">
          <p><strong>Timezone:</strong> {meta.timezone}</p>
          <p><strong>Generated At:</strong> {new Date(meta.generated_at).toLocaleString()}</p>
          <p><strong>Training Years:</strong> {meta.training_years?.join(" - ")}</p>
          <p><strong>Alpha:</strong> {meta.alpha}</p>
          <p><strong>Scale Clamp:</strong> {meta.scale_clamp}</p>
        </div>
      </div>

      {/* Daily Totals Chart */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">📊 Daily Erosion/Accretion</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailyTotals}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total_m" stroke="#2563eb" strokeWidth={3} dot />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Transects */}
      <div className="bg-green-50 p-5 rounded-2xl border border-green-200 shadow-sm">
        <h3 className="text-lg font-semibold text-green-800 mb-3">🏝️ Top Transects (Highest Erosion)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-green-200 text-black">
                <th>Transect ID</th>
                <th>Week Sum (m)</th>
                <th>Annual Δ (m)</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {topTransects.map((t: any, i: number) => (
                <tr key={i} className="border-b border-green-100 text-black">
                  <td>{t.transect_id}</td>
                  <td>{t.week_sum_m.toFixed(2)}</td>
                  <td>{t.typical_annual_delta_m}</td>
                  <td>{t.mid_lat.toFixed(4)}</td>
                  <td>{t.mid_lon.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Transects */}
      <div className="bg-red-50 p-5 rounded-2xl border border-red-200 shadow-sm">
        <h3 className="text-lg font-semibold text-red-800 mb-3">🏖️ Bottom Transects (Highest Accretion)</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-red-200 text-black">
                <th>Transect ID</th>
                <th>Week Sum (m)</th>
                <th>Annual Δ (m)</th>
                <th>Latitude</th>
                <th>Longitude</th>
              </tr>
            </thead>
            <tbody>
              {bottomTransects.map((t: any, i: number) => (
                <tr key={i} className="border-b border-red-100 text-black">
                  <td>{t.transect_id}</td>
                  <td>{t.week_sum_m.toFixed(2)}</td>
                  <td>{t.typical_annual_delta_m}</td>
                  <td>{t.mid_lat.toFixed(4)}</td>
                  <td>{t.mid_lon.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
