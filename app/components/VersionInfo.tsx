import version from "@/version.json" assert { type: "json" };

// Define the shape manually
type VersionInfo = {
  version: string;
  modified: string;
};

const typedVersion = version as VersionInfo;

export default function VersionInfo() {
  return (
    <p className="mt-1 text-xs">
      Site Version {typedVersion.version} – Last modified on {typedVersion.modified}
    </p>
  );
}
