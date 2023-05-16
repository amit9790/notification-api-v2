import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBasicAuth, ApiOperation } from '@nestjs/swagger';
import { CreateNotificationBody } from './dto/CreateNotificationBody';
import { SendNotificationDTO } from '@dto/sendNotification';
import { SendDeviceTokenDTO } from '@dto/sendDevideToken';

import { NotificationsService } from '@services/notifications';

@Controller('v2/notifications')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationsService) {}

  @UseGuards(AuthGuard('basic'))
  @Post('/')
  @ApiOperation({ summary: 'Send notification' })
  @ApiBasicAuth()
  public async sendNotification(
    @Res() res,
    @Req() req,
    @Body() sendNotificationDto: SendNotificationDTO,
  ) {
    const notificationBody: CreateNotificationBody = {
      user_id: sendNotificationDto.userId,
      email: sendNotificationDto.email,
      title: sendNotificationDto.title,
      priority: sendNotificationDto.priority,
      body: sendNotificationDto.body,
    };
    let notification;
    if (sendNotificationDto.date) {
      notificationBody.send_after = sendNotificationDto.date;
      notification = await this.notificationService.storeScheduleNotification(
        notificationBody,
      );
    } else {
      notification = await this.notificationService.sendNotification(
        notificationBody,
      );
    }
    if (notification === null)
      return res
        .status(HttpStatus.OK)
        .json({ notification: 'notification not send' });
    return res.status(HttpStatus.OK).json({ notification });
  }

  @UseGuards(AuthGuard('basic'))
  @Post('/token')
  @ApiOperation({ summary: 'Send notification' })
  @ApiBasicAuth()
  public async saveDeviceToken(
    @Res() res,
    @Req() req,
    @Body() sendDeviceTokenDTO: SendDeviceTokenDTO,
  ) {
    const { userId, token, isdelete } = sendDeviceTokenDTO;
    if (isdelete && !token) {
      await this.notificationService.findByIdAndDelete(userId);
      return res.status(HttpStatus.OK).json({ success: 'token deleted' });
    } else {
      const user = await this.notificationService.findByIdAndUpdates(
        userId,
        token,
      );
      return res.status(HttpStatus.OK).json({ user });
    }
  }
}
