const services = [
	{ title: "Water Damage Restoration", description: "Quick and efficient water damage repair services." },
	{ title: "Fire Damage Restoration", description: "Comprehensive fire damage restoration and cleanup." },
	{ title: "Mold Remediation", description: "Safe and effective mold removal services." },
	{ title: "General Repairs", description: "Quality repairs for all parts of your home." }
];

const ServicesSection = () => (
	<section className='py-12 bg-gray-100'>
		<div className='container mx-auto px-4'>
			<h2 className='text-3xl font-bold text-center mb-8'>Our Services</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
				{services.map((service, index) => (
					<div key={index} className='bg-white p-6 shadow rounded text-center'>
						<div className='placeholder-icon w-16 h-16 bg-gray-300 mx-auto mb-4'></div>
						<h3 className='text-xl font-semibold mb-2'>{service.title}</h3>
						<p className='text-gray-600'>{service.description}</p>
					</div>
				))}
			</div>
		</div>
	</section>
);

export default ServicesSection;
