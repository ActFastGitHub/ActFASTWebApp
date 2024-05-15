export const handleEnterKeyPress = (
	e: React.KeyboardEvent,
	callback: (e: React.KeyboardEvent) => void,
	disabled: boolean,
	setDisabled: React.Dispatch<React.SetStateAction<boolean>>
) => {
	if (e.key === "Enter" && !disabled) {
		callback(e);

		setDisabled(true);

		setTimeout(() => {
			setDisabled(false);
		}, 2000);
	}
};
