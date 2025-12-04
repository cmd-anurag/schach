import ChallengeModal from "./ChallengeModal";

export default function OnlineUsers({users} : {users: string[]}) {
  return (
    <div className="flex flex-col gap-4 max-w-[300px] mt-10  border-gray-700 p-4 rounded-lg">
        <h2 className="font-bold text-xl">Online Players</h2>
        <ul className="flex flex-col gap-3">
            {users.length === 0? <p>No one is online</p> : users.map((user, index) => {
                return (
                    <div key={index} className="flex justify-between items-center rounded-lg border p-3">
                        <li>{user}</li>
                        <ChallengeModal toUsername={user} />
                    </div>
                );
            })}
        </ul>
    </div>
  )
}