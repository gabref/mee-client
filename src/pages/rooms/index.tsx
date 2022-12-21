import { useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import style from './index.module.css';
import { myrooms } from '@data/testData';
import RoomCard from '@components/cards/RoomCard';
import RoomWatcher from '@components/ui/RoomWatcher';
import RoomHostList from '@components/ui/RoomHostList';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';
import { AuthContext } from 'src/contexts/AuthContext';

const SOCKET_CONFIG = {
	reconnectionAttempts: 5,
	reconnectionDelay: 1000,
	autoConnect: true
};

function Rooms() {
	const [ socket, setSocket ] = useState<Socket | null>(null);
	const [ selectedRoom, setSelectedRoom ] = useState(null);
	const [ rooms, setRooms ] = useState([ ...myrooms ]);
	const [ loading, setLoading ] = useState(false);
	const { isAdmin } = useContext(AuthContext)

	useEffect(
		() => {
			let newSocket: Socket;
			if (isAdmin) {
				newSocket = io(process.env.NEXT_PUBLIC_URL_SOCKET + '/admin', SOCKET_CONFIG);
				setSocket(newSocket);
			} else {
				newSocket = io(process.env.NEXT_PUBLIC_URL_SOCKET + '/client', SOCKET_CONFIG);
				setSocket(newSocket);
			}

			return () => {
				newSocket.close();
			};
		},
		[ setSocket ]
	);

	// socket list-rooms => setLoading - false && setRooms

	return (
		<div>
			{socket ? (
				<div>
					{
						isAdmin ? 
						<RoomHostList /> :
						(
							<div>
								{
									!selectedRoom ? (
										<div>
											<h1>Salas</h1>
											<br />

											<div className={style.roomsList}>
												{!loading ? (
													rooms.map(({ roomId, preview, description, available }) => (
														<RoomCard
															key={roomId}
															roomId={roomId}
															preview={preview}
															description={description}
															available={available}
														/>
													))
												) : (
													'Carregando...'
												)}
											</div>
										</div>
									) : (
										<RoomWatcher />
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