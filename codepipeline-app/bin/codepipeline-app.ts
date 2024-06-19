#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServStack } from '../stack/cpstack';



const app = new cdk.App();

new ServStack(app, 'CStack', {});