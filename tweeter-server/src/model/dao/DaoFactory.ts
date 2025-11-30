import { AuthDao } from "./AuthDao";
import { AuthDaoDynamo } from "./AuthDaoDynamo";
import { FollowDao } from "./FollowDao";
import { FollowDaoDynamo } from "./FollowDaoDynamo";
import { StatusDao } from "./StatusDao";
import { StatusDaoDynamo } from "./StatusDaoDynamo";
import { StorageDao } from "./StorageDao";
import { StorageDaoS3 } from "./StorageDaoS3";
import { UserDao } from "./UserDao";
import { UserDaoDynamo } from "./UserDaoDynamo";

export class DaoFactory {
  getAuthDao(): AuthDao {
    return new AuthDaoDynamo();
  }
  getUserDao(): UserDao {
    return new UserDaoDynamo();
  }
  getStorageDao(): StorageDao {
    return new StorageDaoS3();
  }
  getFollowDao(): FollowDao {
    return new FollowDaoDynamo();
  }
  getStatusDao(): StatusDao {
    return new StatusDaoDynamo();
  }
}
