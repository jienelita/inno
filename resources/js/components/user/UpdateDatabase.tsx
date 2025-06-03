import { router } from "@inertiajs/react";
import { Avatar, Button, Col, message, Row } from "antd";
import { useEffect, useState } from 'react';
interface Props {
  userinfo: {
    user_id: number;
    cid: number;
  };
}
export default function UpdateDatabase({ userinfo }: Props) {

    const updatemembersDatabase = () => {
        router.post(
            '/update-user-database',
            {
                records: userinfo
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    message.success('Account successfully updated!');
                },
                onError: () => {
                    message.success('Unable to update!');
                }
            }
        );
    }
    return (
        <div>
            <Button type="primary"  iconPosition='start' onClick={updatemembersDatabase}>
                Loading
            </Button>
        </div>
    )
}