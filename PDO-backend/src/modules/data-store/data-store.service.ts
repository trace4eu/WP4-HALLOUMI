import {  Injectable, Logger } from "@nestjs/common";


@Injectable()
export class DataStoreService {
  private readonly logger = new Logger(DataStoreService.name);

  constructor() {}

}

export default DataStoreService;
