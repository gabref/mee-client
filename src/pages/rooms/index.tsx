import { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';

import RoomWatcher from '@components/Room/RoomWatcher';
import RoomWatcherList from '@components/RoomsList/RoomWatcherList';
import { TRoom } from '@customTypes/types';
import { AuthContext } from 'src/contexts/AuthContext';
import { EVENTS } from '@data/events';

const SOCKET_CONFIG = {
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	autoConnect: true,
};

function Rooms() {
	const { userState } = useContext(AuthContext)
	const [ socket, setSocket ] = useState<Socket | null>(null);
	const [ selectedRoom, setSelectedRoom ] = useState<TRoom | null>(null);

	useEffect(
		() => {
			if (!userState) return

			const socketUrl = process.env.NEXT_PUBLIC_URL_SOCKET + EVENTS.NAMESPACE.CLIENT
			const newSocket = io(socketUrl, SOCKET_CONFIG)
			setSocket(newSocket)

			window.onbeforeunload = () => {
				newSocket.emit(EVENTS.CLIENT.END, userState?.id)
				console.log('unloaded admin')
			}

			return () => {
				newSocket.close();
			};
		},
		[ setSocket, userState ]
	);

	return (
		<div>
            { userState ? (
                userState?.roles.indexOf('user')! == -1 ? (
                    <div>
                        <p>{userState.name}</p>
                        <p>Você não tem acesso a essa página!</p>
                    </div>
                ) : (
					socket ? (
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
					) : (
						<p>No socket</p>
					)
                )
            ) : (
                <p>Carregando state...</p>
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