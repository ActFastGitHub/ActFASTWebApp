import version from "@/version.json";

export default function VersionInfo() {
  return (
    <p className="mt-1 text-xs">
      Site Version {version.major}.{version.minor} – Last modified on {version.modified}
    </p>
  );
}
