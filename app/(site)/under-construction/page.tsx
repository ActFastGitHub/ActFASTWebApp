import Image from "next/image";
import constructionImage from "@/app/images/under-construction.png"; // Replace with your actual image path

const UnderConstruction = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
    <Image
      src={constructionImage}
      alt="Under Construction"
      className="mb-8 w-1/2 md:w-1/3 lg:w-1/4"
    />
    <h1 className="mb-4 text-3xl font-bold text-gray-800 md:text-4xl">
      Page Under Construction
    </h1>
    <p className="max-w-lg text-center text-lg text-gray-600 md:text-xl">
      Friendly message from Angelo. I'm working hard to improve our website and
      this page will be ready to launch soon. Stay tuned!
    </p>
  </div>
);

export default UnderConstruction;
