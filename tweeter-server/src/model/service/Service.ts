import { DaoFactory } from "../dao/DaoFactory";

export class Service {
  protected readonly factory = new DaoFactory();
}
