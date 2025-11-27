import { AuthDao } from "./AuthDao";
import { AuthDaoDynamo } from "./AuthDaoDynamo";

export class DaoFactory {
  getAuthDao(): AuthDao {
    return new AuthDaoDynamo();
  }
}
