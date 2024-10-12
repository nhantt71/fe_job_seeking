const CompanyList = ({ company }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md text-black">
            <div className="flex justify-center mb-4">
                <img
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    className="h-16 w-16 object-contain"
                />
            </div>

            <h2 className="text-lg font-semibold text-center">{company.name}</h2>

            <p className="text-gray-500 text-center">{company.addressDetail}</p>

            <div className="flex justify-center mt-4">
                <button className="bg-green-500 text-white py-1 px-4 rounded">
                    View Details
                </button>
            </div>
        </div>
    );
};

export default CompanyList;
