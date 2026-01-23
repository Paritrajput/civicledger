export default function AboutPage() {
  const sections = [
    {
      title: "Our Mission",
      content:
        "To empower citizens, government authorities, and contractors with a transparent and trustworthy digital ecosystem for public tenders and contracts.",
    },
    {
      title: "Our Vision",
      content:
        "To create a transparent and efficient government contract system that benefits all stakeholders.",
    },
    {
      title: "Our Values",
      content: "Integrity, Transparency, and Community Engagement.",
    },
    {
      title: "Why Blockchain?",
      content:
        "Blockchain ensures transparency and trust. Every contract, bid, and approval is recorded on a tamper-proof ledger, making it accessible for public verification.",
    },
  ];

  const features = [
    "Enable public and fair bidding for government tenders",
    "Track milestones with verification by officials and citizens",
    "Release funds through automated smart contracts",
    "Ensure accountability through immutable records",
  ];

  return (
    <div className="relative min-h-screen text-white">
      {/* Fixed background */}
      <div className="fixed inset-0 -z-10 bg-linear-to-t from-[#22043e] to-[#04070f]" />

      <div className="relative max-w-6xl mx-auto px-4 md:px-8 py-14">
        {/* Header */}
        <h1 className="text-3xl md:text-5xl font-bold mb-6 text-center">
          About CivicLedger
        </h1>

        <p className="text-gray-400 text-lg max-w-3xl mx-auto text-center mb-12 leading-relaxed">
          <strong className="text-white">CivicLedger</strong> is a decentralized
          platform designed to transform how government contracts are handled.
          Using blockchain technology, we bring transparency, accountability,
          and efficiency to public infrastructure projects.
        </p>

        {/* Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-6 shadow-lg hover:border-gray-600 hover:-translate-y-1 transition"
            >
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <p className="text-gray-400 leading-relaxed">{section.content}</p>
            </div>
          ))}
        </div>

        {/* What We Do Section */}
        <div className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-lg mb-12">
          <h2 className="text-2xl font-semibold mb-6">What We Do</h2>
          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-gray-400">
                <span className="text-teal-400 mr-3 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Who We Serve Section */}
        <div className="bg-[#14162d8a] backdrop-blur-xl border border-gray-800 rounded-2xl p-8 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Who We Serve</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-teal-400 font-semibold mb-2">Government</h3>
              <p className="text-gray-400">
                Manage tenders, approve milestones, track progress
              </p>
            </div>
            <div>
              <h3 className="text-teal-400 font-semibold mb-2">Contractors</h3>
              <p className="text-gray-400">
                Submit bids, get paid on verified milestones
              </p>
            </div>
            <div>
              <h3 className="text-teal-400 font-semibold mb-2">Citizens</h3>
              <p className="text-gray-400">
                Vote on project quality, monitor public spending
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
