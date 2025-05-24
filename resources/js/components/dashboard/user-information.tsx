type Props = {
    data?: {
        id: number;
        name: string;
        email: string;
        // add more fields as needed
    };
};


const UserInformation = ({ data }: Props) => {
    if (!data) return <p>No user data found.</p>;
    return (
        <div>
            <p>Name: {data.name}</p>
            <p>Email: {data.email}</p>
        </div>
    );
};

export default UserInformation;
