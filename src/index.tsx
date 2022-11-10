import React from "react";
import ReactDOM from "react-dom";
import CustomDataFrame from "./CustomDataFrame";
import { config } from "dotenv";

config();

// Wrap your CustomDataFrame with the baseui them
ReactDOM.render(
	<React.StrictMode>
		<CustomDataFrame />
	</React.StrictMode>,
	document.getElementById("root")
);
