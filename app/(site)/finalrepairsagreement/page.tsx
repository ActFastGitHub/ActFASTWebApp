"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ActFastLogo from "@/app/images/actfast-logo.jpg";
import axios from "axios";
// import SignatureCanvas from "react-signature-canvas";
import toast from "react-hot-toast";

const FinalRepairsAgreementPage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [projectCode, setProjectCode] = useState("");
  const [signedOn, setSignedOn] = useState<string | null>(null);
  const [generalNotes, setGeneralNotes] = useState("");
  const [flooring, setFlooring] = useState<any[]>([]);
  const [baseboard, setBaseboard] = useState<any[]>([]);
  const [doorCasing, setDoorCasing] = useState<any[]>([]);
  const [stairNosing, setStairNosing] = useState<any[]>([]);
  const [stairRailing, setStairRailing] = useState<any[]>([]);

//   const sigCanvasRef = useRef<SignatureCanvas | null>(null);

  useEffect(() => {
    if (status !== "loading" && !session) router.push("/login");
  }, [session, status, router]);

  useEffect(() => {
    const fetchAgreement = async () => {
      try {
        const res = await axios.get("/api/finalrepairsagreement");
        const data = res.data;
        if (data) {
          setProjectCode(data.projectCode);
          setSignedOn(data.signedOn);
          setGeneralNotes(data.generalNotes || "");

          const [flooringRes, baseboardRes, casingRes, nosingRes, railingRes] = await Promise.all([
            axios.get(`/api/finalrepairsagreement/flooring?projectCode=${data.projectCode}`),
            axios.get(`/api/finalrepairsagreement/baseboard?projectCode=${data.projectCode}`),
            axios.get(`/api/finalrepairsagreement/doorcasing?projectCode=${data.projectCode}`),
            axios.get(`/api/finalrepairsagreement/stairnosing?projectCode=${data.projectCode}`),
            axios.get(`/api/finalrepairsagreement/stairrailing?projectCode=${data.projectCode}`),
          ]);

          setFlooring(flooringRes.data || []);
          setBaseboard(baseboardRes.data || []);
          setDoorCasing(casingRes.data || []);
          setStairNosing(nosingRes.data || []);
          setStairRailing(railingRes.data || []);
        }
      } catch (error) {
        console.error("Error loading final agreement", error);
      }
    };
    fetchAgreement();
  }, []);

  const handleSectionSave = async (section: string, data: any[]) => {
    try {
      await axios.post(`/api/finalrepairsagreement/${section}`, { projectCode, data });
      toast.success(`${section} saved successfully.`);
    } catch {
      toast.error(`Failed to save ${section}`);
    }
  };

  const handleDelete = (section: string, index: number) => {
    const update = (list: any[], setter: any) => setter(list.filter((_, i) => i !== index));
    switch (section) {
      case "flooring": update(flooring, setFlooring); break;
      case "baseboard": update(baseboard, setBaseboard); break;
      case "doorCasing": update(doorCasing, setDoorCasing); break;
      case "stairNosing": update(stairNosing, setStairNosing); break;
      case "stairRailing": update(stairRailing, setStairRailing); break;
    }
  };

  const dropdownTypes = ["Laminate", "Vinyl", "Hardwood", "Tile", "Carpet"];

  const addItem = (section: string) => {
    let newItem = {};
    switch (section) {
      case "flooring": newItem = { type: "", code: "", location: "" }; break;
      case "baseboard":
      case "doorCasing": newItem = { type: "", size: "", notes: "" }; break;
      case "stairNosing":
      case "stairRailing": newItem = { type: "", notes: "" }; break;
    }
    switch (section) {
      case "flooring": setFlooring([...flooring, newItem]); break;
      case "baseboard": setBaseboard([...baseboard, newItem]); break;
      case "doorCasing": setDoorCasing([...doorCasing, newItem]); break;
      case "stairNosing": setStairNosing([...stairNosing, newItem]); break;
      case "stairRailing": setStairRailing([...stairRailing, newItem]); break;
    }
  };

  const handleFieldChange = (section: string, index: number, key: string, value: string) => {
    const update = (list: any[], setter: any) => {
      const updated = [...list];
      updated[index][key] = value;
      setter(updated);
    };
    switch (section) {
      case "flooring": update(flooring, setFlooring); break;
      case "baseboard": update(baseboard, setBaseboard); break;
      case "doorCasing": update(doorCasing, setDoorCasing); break;
      case "stairNosing": update(stairNosing, setStairNosing); break;
      case "stairRailing": update(stairRailing, setStairRailing); break;
    }
  };

  const handleSaveAgreement = async () => {
    try {
    //   const signatureDataUrl = sigCanvasRef.current?.getTrimmedCanvas().toDataURL("image/png");
      await axios.post("/api/finalrepairsagreement/save-all", {
        projectCode,
        generalNotes,
        signedOn: new Date().toISOString(),
        // signature: signatureDataUrl,
      });
      toast.success("Agreement saved.");
    } catch {
      toast.error("Failed to save agreement.");
    }
  };

  const renderSection = (title: string, items: any[], section: string) => (
    <div className="mb-6 border-t pt-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <button onClick={() => addItem(section)} className="text-sm bg-blue-500 text-white px-3 py-1 rounded">+ Add</button>
      </div>
      {items.map((item, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
          {section === "flooring" && (
            <>
              <select value={item.type} onChange={(e) => handleFieldChange(section, idx, "type", e.target.value)} className="border rounded p-1">
                <option value="">Select Type</option>
                {dropdownTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <input
                placeholder="Code"
                value={item.code}
                onChange={(e) => handleFieldChange(section, idx, "code", e.target.value)}
                className="border rounded p-1"
              />
              <textarea
                placeholder="Location / Room"
                value={item.location}
                onChange={(e) => handleFieldChange(section, idx, "location", e.target.value)}
                className="border rounded p-1 col-span-1 md:col-span-3"
              />
            </>
          )}
          {(section === "baseboard" || section === "doorCasing") && (
            <>
              <select value={item.type} onChange={(e) => handleFieldChange(section, idx, "type", e.target.value)} className="border rounded p-1">
                <option value="">Select Type</option>
                {dropdownTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <input
                placeholder="Size"
                value={item.size}
                onChange={(e) => handleFieldChange(section, idx, "size", e.target.value)}
                className="border rounded p-1"
              />
              <textarea
                placeholder="Notes"
                value={item.notes}
                onChange={(e) => handleFieldChange(section, idx, "notes", e.target.value)}
                className="border rounded p-1"
              />
            </>
          )}
          {(section === "stairNosing" || section === "stairRailing") && (
            <>
              <select value={item.type} onChange={(e) => handleFieldChange(section, idx, "type", e.target.value)} className="border rounded p-1">
                <option value="">Select Type</option>
                {dropdownTypes.map((type) => <option key={type}>{type}</option>)}
              </select>
              <textarea
                placeholder="Notes"
                value={item.notes}
                onChange={(e) => handleFieldChange(section, idx, "notes", e.target.value)}
                className="border rounded p-1 col-span-1 md:col-span-2"
              />
            </>
          )}
          <div className="flex justify-end space-x-2 col-span-1 md:col-span-3">
            <button onClick={() => handleSectionSave(section, items)} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Save</button>
            <button onClick={() => handleDelete(section, idx)} className="text-xs bg-red-600 text-white px-2 py-1 rounded">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl bg-white p-6 shadow-lg print:max-w-full print:shadow-none print:p-4">
      <div className="flex justify-center mb-4">
        <img src={ActFastLogo.src} alt="Company Logo" className="h-20 object-contain" />
      </div>

      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold">Final Repairs Agreement</h1>
        <p className="text-sm text-gray-600">Project Code: <strong>{projectCode}</strong></p>
        {signedOn && <p className="text-sm text-gray-600">Signed On: <strong>{new Date(signedOn).toLocaleDateString()}</strong></p>}
      </div>

      {renderSection("Flooring", flooring, "flooring")}
      {renderSection("Baseboard", baseboard, "baseboard")}
      {renderSection("Door Casing", doorCasing, "doorCasing")}
      {renderSection("Stair Nosing", stairNosing, "stairNosing")}
      {renderSection("Stair Railing", stairRailing, "stairRailing")}

      <div className="mb-6 border-t pt-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">General Notes</h2>
        <textarea
          value={generalNotes}
          onChange={(e) => setGeneralNotes(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mt-10 border-t pt-6">
        <h2 className="text-sm font-semibold mb-2">Client Signature:</h2>
        {/* <SignatureCanvas
          penColor="black"
          ref={sigCanvasRef}
          canvasProps={{ className: "w-full border h-32" }}
        /> */}
        <p className="text-xs text-gray-500 mt-1">Sign above</p>
      </div>

      <div className="mt-6 flex justify-end">
        <button onClick={handleSaveAgreement} className="bg-green-600 text-white px-4 py-2 rounded">Save Agreement</button>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mt-10 border-t pt-4">
        <div>
          <p>Unit 108 - 11539 136 Street, Surrey, BC</p>
          <p>www.actfast.ca</p>
        </div>
        <div className="text-right">
          <p>(604)-518-5129</p>
          <p>info@actfast.ca</p>
        </div>
      </div>
    </div>
  );
};

export default FinalRepairsAgreementPage;
