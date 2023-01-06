import { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import RoomWatcher from '@components/ui/RoomWatcher';
import RoomHostList from '@components/ui/RoomHostList';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { AuthContext } from 'src/contexts/AuthContext';
import RoomWatcherList from '@components/ui/RoomWatcherList';
import { TRoom } from '@customTypes/types';

const SOCKET_CONFIG = {
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	autoConnect: true,
};

function Rooms() {
	const [ socket, setSocket ] = useState<Socket | null>(null);
	const [ selectedRoom, setSelectedRoom ] = useState<TRoom | null>(null);
	const { isAdmin, userRef } = useContext(AuthContext)

	useEffect(
		() => {
			const namespace = userRef.current?.isAdmin ? '/admin' : '/client'
			const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET + namespace
			const newSocket = io(socketUrl, SOCKET_CONFIG)
			setSocket(newSocket)

			return () => {
				newSocket.close();
			};
		},
		[ setSocket ]
	);

	return (
		<div>
			{socket ? (
				<div>
					{
						isAdmin.current ? 
						<RoomHostList socket={socket} /> :
						(
							<div>
								{
									!selectedRoom ? (
										<RoomWatcherList 
											socket={socket} 
											setSelectedRoom={setSelectedRoom} 
										/>
									) : (
										<RoomWatcher 
											socket={socket}
											room={selectedRoom} 
											setSelectedRoom={setSelectedRoom} 
										/>
									)
								}
							</div>
						)
					}
				</div>
			) : (
				<p>No socket</p>
			)}
		</div>
	);
}

export default Rooms;

export const getServerSideProps: GetServerSideProps = async (ctx) => {
	const { ['mee.token-auth']: token } = parseCookies(ctx)

	if (!token) {
		return {
			redirect: {
				destination: '/login',
				permanent: false
			}
		}
	}

	return {
		props: {

		}
	}
}