// app/config/branches.ts
export type BranchConfig = {
  slug: string;
  label: string;
  navLabel?: string;
  isMain?: boolean;

  sinceLabel?: string;
  addressText: string;
  addressUrl?: string;
  mapEmbedSrc: string;

  phone: string;
  email: string;
  serviceAreas: string[];
};

// ✅ Update these
export const SURREY_BRANCH: BranchConfig = {
  slug: "surrey",
  label: "Surrey",
  navLabel: "Surrey (Main Office)",
  isMain: true,
  sinceLabel: "In business since 2015",
  addressText: "Unit 108 - 11539 136 Street, Surrey, BC",
  addressUrl: "https://maps.app.goo.gl/cEr3uFjKEuKyhNdm9",
  mapEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2606.3557414453408!2d-122.84838482401653!3d49.212780175702356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5485d78646b81a55%3A0x66d23eb8e8b7465e!2sActFAST%20Restoration%20and%20Repairs!5e0!3m2!1sen!2sca!4v1753476348622!5m2!1sen!2sca",
  phone: "+16045185129",
  email: "info@actfast.ca",
  serviceAreas: ["Surrey", "Langley", "Delta", "New Westminster", "Burnaby", "Vancouver"],
};

export const OKANAGAN_BRANCH: BranchConfig = {
  slug: "okanagan",
  label: "Okanagan",
  navLabel: "Okanagan Branch",
  isMain: false,
  sinceLabel: "Serving since Feb 2025",
  addressText: "6650 Okanagan Avenue, Vernon BC",
  addressUrl: "https://maps.app.goo.gl/QJV6DdTxyCQ5bN7z5",
  mapEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2099.884443476297!2d-119.3356649240987!3d50.24041997155282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537ddf1c722644a1%3A0x7e966be225c57ab1!2s6650%20Okanagan%20Ave%2C%20Vernon%2C%20BC%20V1H%201M2!5e1!3m2!1sen!2sca!4v1766430015000!5m2!1sen!2sca",
  phone: "+16045185129",
  email: "info@actfast.ca",
  serviceAreas: [
    "Vernon",
    "Coldstream",
    "Lake Country",
    "Kelowna",
    "West Kelowna",
    "Peachland",
    "Penticton",
    "Summerland",
    "Armstrong",
    "Enderby",
  ],
};

// ✅ Add this export to use in navbar
export const BRANCHES: BranchConfig[] = [SURREY_BRANCH, OKANAGAN_BRANCH];
