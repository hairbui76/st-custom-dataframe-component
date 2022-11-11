import React from "react";
import { createRoot } from "react-dom/client";
import CustomDataFrame from "./CustomDataFrame";
import { config } from "dotenv";

config();

// Wrap your CustomDataFrame with the baseui them
createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<CustomDataFrame />
	</React.StrictMode>
);
