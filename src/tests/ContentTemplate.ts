import { type TestLogger } from "@paperback/types";

import { ContentTemplate } from "../ContentTemplate/main.js";
import sourceInfo from "../ContentTemplate/pbconfig.js";
import { TestSuite, registerDefaultTests } from "./suite.js";

export async function runTests(logger: TestLogger) {
  const suite = new TestSuite("ContentTemplate tests", logger);
  registerDefaultTests(suite, ContentTemplate, sourceInfo);

  await suite.run();
}
