import { AuthDao } from "./AuthDao";
import { AuthDaoDynamo } from "./AuthDaoDynamo";
import { UserDao } from "./UserDao";
import { UserDaoDynamo } from "./UserDaoDynamo";

export class DaoFactory {
  getAuthDao(): AuthDao {
    return new AuthDaoDynamo();
  }
  getUserDao(): UserDao {
    return new UserDaoDynamo();
  }
}
