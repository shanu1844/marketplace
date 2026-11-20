import { Link } from "react-router-dom";

function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#F7F5EF] px-4 py-16 text-[#252923]">
      <section className="w-full max-w-xl rounded-[20px] border border-[#E7E4DB] bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="text-sm font-bold tracking-[0.18em] text-[#174B38]">MARKETHUB · 404</span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Page not found</h1>
        <p className="mt-3 leading-7 text-[#73786F]">The page you are looking for does not exist or may have been moved.</p>
        <Link to="/" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-[#174B38] px-6 py-3 text-sm font-semibold text-white! transition hover:bg-[#103729] focus:outline-none focus:ring-2 focus:ring-[#174B38] focus:ring-offset-2">Go home</Link>
      </section>
    </main>
  );
}

export default NotFound;
