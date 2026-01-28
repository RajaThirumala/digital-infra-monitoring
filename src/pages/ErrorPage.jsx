import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Oops!</h1>
        <p>Sorry, an unexpected error has occurred.</p>
        <p className="text-red-500">{error.statusText || error.message}</p>
      </div>
    </div>
  );
}