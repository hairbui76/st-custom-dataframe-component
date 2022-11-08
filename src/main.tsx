import React from "react";
import ReactDOM from "react-dom/client";
import CustomDataFrame from "./CustomDataFrame";

// Wrap your CustomDataFrame with the baseui them
const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement
);
root.render(
	<React.StrictMode>
		<CustomDataFrame />
	</React.StrictMode>
);
