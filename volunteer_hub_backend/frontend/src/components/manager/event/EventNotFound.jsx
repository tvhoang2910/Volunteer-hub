import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/router";

export default function EventNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white shadow-xl rounded-2xl px-10 py-12 text-center space-y-4 border border-gray-100">
        <p className="text-2xl font-semibold text-gray-800">
          Khong tim thay du an
        </p>
        <p className="text-gray-500">
          Ma du an khong hop le. Vui long quay lai danh sach va thu lai.
        </p>
        <button
          onClick={() => router.push("/manager/events")}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lai danh sach
        </button>
      </div>
    </div>
  );
}
