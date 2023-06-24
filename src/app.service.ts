import { Injectable } from '@nestjs/common';

import {
  resolveNodeId,
  AttributeIds,
  OPCUAClient,
  DataValue,
  BrowseResult,
  ReferenceDescription,
  TimestampsToReturn,
  StatusCode,
  StatusCodes,
  DataType,
  ClientSession,
} from 'node-opcua';

// const endpointUrl = 'opc.tcp://opcuademo.sterfive.com:26543';
// const nodeId = 'ns=7;s=Scalar_Simulation_Double';
/*
opc.tcp://opcua.rocks:4840
opc.tcp://opcua.umati.app:4840
opc.tcp://opcua2.umati.app:4840
opc.tcp://milo.digitalpetri.com:62541/milo
 */
const endpointUrl = 'opc.tcp://opcuademo.sterfive.com:26543';

@Injectable()
export class AppService {
  client: OPCUAClient;
  session: ClientSession;

  constructor() {
    this.client = OPCUAClient.create({
      endpoint_must_exist: true,
      transportSettings: {
        maxMessageSize: 100000000, // to avoid bug https://github.com/node-opcua/node-opcua/issues/1263
      },
      connectionStrategy: {
        maxRetry: 100000000,
        initialDelay: 2000,
        maxDelay: 10 * 1000,
      },
    });
    this.client.on('backoff', () => console.log('retrying connection'));

    this.start();
  }

  async start() {
    await this.client.connect(endpointUrl);
    this.session = await this.client.createSession();

    const browseResult: BrowseResult = (await this.session.browse(
      'RootFolder',
    )) as BrowseResult;

    for (const n of browseResult.references) {
      console.log('-------------');
      console.log(n.nodeId.toString());
      console.log(n.displayName);
      console.log(n.browseName.toString());
      console.log(n.nodeClass.toString());
      console.log(n.typeDefinition.toString());
      console.log(n.referenceTypeId.toString());
      console.log('-------------');
    }

    for (const n of browseResult.references) {
      // console.log(n);
      const dataValue = await this.session.read({
        nodeId: n.nodeId.toString(),
        attributeId: AttributeIds.Description,
      });
      if (dataValue.statusCode !== StatusCodes.Good) {
        console.log('Could not read ', n.nodeId.toString());
      }
    }
  }

  getRandom(min:number, max:number): number {
    return Math.floor(Math.random() * (max - min) + min);
  }

  async getValue(path:string): Promise<string>{
    path = path.toLowerCase();
    if(path.includes("coolant"))
      return (this.getRandom(-100, 20)).toString();
    else if(path.includes("temp"))
      return (this.getRandom(25, 400)).toString();
    else if(path.includes("voltage"))
      return (this.getRandom(220, 240)).toString();
    else if(path.includes("current"))
      return (this.getRandom(1, 10)).toString();
    else if(path.includes("fuel"))
      return (this.getRandom(0, 100)).toString();
    else if(path.includes("umidade"))
      return (this.getRandom(0, 100)).toString();
    else if(path.includes("automode"))
      return (this.getRandom(0, 1) > 0.5).toString();
    else
      return "0";
  }
}
