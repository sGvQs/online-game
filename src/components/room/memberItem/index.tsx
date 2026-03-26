import Image from "next/image";
import { Crown, UserMinus, UserRound } from "lucide-react";
import { RoomUserWithUser, UserRanking } from "@/types";
import {
	FACE_ICON_PATHS,
	DEFAULT_FACE_ICON,
} from "@/constants/common/faceIcon";
import { memberItem } from "./styles";
import { IconButton } from "@/components/ui/iconButton";

const styles = memberItem();

interface MemberItemProps {
	member: RoomUserWithUser;
	ranking?: UserRanking;
	isHostMember?: boolean;
	showKickButton?: boolean;
	onKick?: () => void;
	isKicking?: boolean;
}

/**
 * MemberItem - メンバー情報を表示するPresentational Component
 * ホスト時はゲストに追放ボタンを表示
 */
export function MemberItem({
	member,
	ranking,
	isHostMember,
	showKickButton,
	onKick,
	isKicking,
}: MemberItemProps) {
	const statusText = ranking
		? `${ranking.rank}位 ${ranking.points}pt`
		: "参加中";

	const faceIcon = member.user.faceIcon ?? DEFAULT_FACE_ICON;
	const faceIconPath = FACE_ICON_PATHS[faceIcon];

	return (
		<li className={styles.wrapper()}>
			<div className={`${styles.avatar()} relative overflow-hidden`}>
				<Image
					src={faceIconPath}
					alt={member.user.name}
					fill
					className="object-contain"
				/>
			</div>
			<div className={styles.info()}>
				<p className={styles.name()}>
					{isHostMember
						? <Crown className={styles.hostIcon()} />
						: <UserRound className={styles.guestIcon()} />
					}
					{member.user.name}
				</p>
				<p className={styles.status()}>{statusText}</p>
			</div>
			{showKickButton ? (
				<IconButton
					variant="danger"
					size="sm"
					icon={<UserMinus className="w-4 h-4" />}
					tooltip="ルームから追放"
					onClick={onKick}
					disabled={isKicking}
				/>
			) : (
				<div className={styles.indicator()} />
			)}
		</li>
	);
}
