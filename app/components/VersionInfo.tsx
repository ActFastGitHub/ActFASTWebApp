import version from "@/version.json" assert { type: "json" };

// Define the shape manually
type VersionInfo = {
  version: string;
  modified: string;
};

const typedVersion = version as VersionInfo;

export default function VersionInfo() {
  return (
    <p className="text-xs text-gray-500 text-center mt-4">
      Version {typedVersion.version} – Modified on {typedVersion.modified}
    </p>
  );
}
