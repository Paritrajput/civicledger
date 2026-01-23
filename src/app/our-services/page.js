export default function ServicesPage() {
  const services = [
    {
      title: "Smart Contract-Based Tenders",
      desc: "Automate tender allocation and ensure fairness with blockchain-backed smart contracts. No middlemen, no manipulation.",
    },
    {
      title: "Milestone-Based Fund Release",
      desc: "Funds are securely locked and released only after verified milestone completion.",
    },
    {
      title: "Public Participation & Voting",
      desc: "Citizens actively monitor and vote on project progress through a transparent system.",
    },
    {
      title: "Role-Based Access Control",
      desc: "Dedicated dashboards for Public users, Contractors, and Government officials.",
    },
    {
      title: "Secure Authentication",
      desc: "Email and OAuth-based login with JWT-powered session security.",
    },
    {
      title: "Project History & Transparency",
      desc: "Complete traceability of tenders, bids, votes, milestones, and payments.",
    },
  ];

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-14">
        {/* Header */}
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center">
          Our Services
        </h1>

        <p className="text-gray-400 text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
          CivicLedger provides a transparent, secure, and citizen-driven
          ecosystem for managing public infrastructure projects using blockchain
          technology.
        </p>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-gray-600 hover:-translate-y-1 transition"
            >
              <h2 className="text-xl font-semibold mb-3">
                {service.title}
              </h2>
              <p className="text-gray-400 leading-relaxed">
                {service.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
