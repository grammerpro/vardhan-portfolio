export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4 text-slate-900">Contact</h1>
      <p className="text-lg text-slate-700 mb-4">
        Feel free to reach out to me via the links below.
      </p>
      <ul className="text-lg text-sky-700 space-y-2">
        <li>
          <a href="mailto:adabalavardhan@gmail.com" className="underline">Email</a>
        </li>
        <li>
          <a href="https://www.linkedin.com/in/vardhanadabala" target="_blank" rel="noopener noreferrer" className="underline">LinkedIn</a>
        </li>
        <li>
          <a href="https://github.com/vardhantech" target="_blank" rel="noopener noreferrer" className="underline">GitHub</a>
        </li>
      </ul>
    </div>
  );
}
