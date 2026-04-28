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
  addressText: "Unit 203 - 5000 Silver Star Rd, Vernon BC",
  addressUrl: "https://maps.app.goo.gl/oLHLKNcoWdQyvgVq7",
  mapEmbedSrc:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2307.235340892449!2d-119.2489861!3d50.2811354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x537dd86070c31ded%3A0xbde9da8e2d62dfef!2s5000%20Silver%20Star%20Rd%20%23203%2C%20Vernon%2C%20BC%20V1B%200A9!5e1!3m2!1sen!2sca!4v1777414914235!5m2!1sen!2sca",
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


