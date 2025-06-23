import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { FileImageOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react'
import { Button, Image, Popconfirm, Space, Table, TableProps, Tag, Tooltip } from 'antd';
import { Delete, Eye, FileImage, Trash, Trash2, View } from 'lucide-react';
import React, { Component, useState } from 'react'
const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'File Manager',
    href: '/file-manager',
  }
];

interface DataType {
  key: number;
  image_name: string;
  image_tag: number;
  created_at: string;
  category: string;
  size: string;
  id: number;
}

type ImageRow = {
  id: number;
  image_name: string;
  image_tag: number;
  created_at: string;
  category: string;
  size: string;
}

interface Props {
  user_image: ImageRow[]
}

export default function FileManager({ user_image }: Props) {

  const dataSource: DataType[] = user_image.map((imgs) => ({
    key: imgs.id,
    image_name: imgs.image_name,
    created_at: imgs.created_at,
    image_tag: imgs.image_tag,
    category: imgs.category,
    size: imgs.size,
    id: imgs.id
  }));
  const [visible, setVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | undefined>();

  const columns: TableProps<DataType>['columns'] = [
    {
      title: 'Image Name',
      dataIndex: 'image_name',
      key: 'image_name',
      render: (_, record) => (
        <div className='flex'>
        {record.category === 'Image' && (
          <FileImageOutlined />
        )}
        {record.image_name}
        </div>
      )
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Space size="middle">
            <Tooltip title="View Image">
            <Eye
              className="w-5 h-5 text-blue-800 cursor-pointer"
              onClick={() => {
                setPreviewImage(`/images/${record.image_name}`);
                setVisible(true);
              }}
            />
            </Tooltip>

            
              {/* <Popconfirm
                title="Delete the loan"
                description="Are you sure you want to delete this loan?"
                okText="Yes"
                cancelText="No"
                placement="topRight"
                disabled={record.id === 1}>
                <Trash2 className='w-5 h-5 text-amber-800'></Trash2>
              </Popconfirm> */}
            
          </Space>

          <Image
            style={{ display: 'none' }}
            preview={{
              visible,
              src: previewImage,
              onVisibleChange: (value) => setVisible(value),
            }}
          />
        </>
      ),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="File Manager" />
      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
        <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
          <div className="p-4 md:p-4">
            <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
              File Manager
            </h3>
            <Table<DataType> columns={columns} dataSource={dataSource} />
          </div>
        </div >

      </div >
    </AppLayout >
  )

}