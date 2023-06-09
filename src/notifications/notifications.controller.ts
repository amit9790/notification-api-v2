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
      type: sendNotificationDto.type,
      data: sendNotificationDto.data,
    };
    let notification;
    if (sendNotificationDto.date) {
      notificationBody.send_after = sendNotificationDto.date;
      const user = await this.notificationService.findById(
        sendNotificationDto.userId,
      );
      if (user) {
        notificationBody.to = user.deviceToken;
        notification = await this.notificationService.storeScheduleNotification(
          notificationBody,
        );
      }
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
}
