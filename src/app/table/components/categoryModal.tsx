import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    VStack,
    Text,
    Tag
} from '@chakra-ui/react';

type ChildCategory = {
    category: string;
    categoryPriority: string;
    childCategory: ChildCategory[];
};

type Menu = {
    category: string;
    categoryPriority: string;
    childCategory: ChildCategory[];
};

type Props = {
    data: Menu[];
};

const CategoryModal: React.FC<Props> = ({ data }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const toggleModal = () => {
        setIsOpen(!isOpen);
    };

    const renderMenu = (menu: Menu, depth: number = 0) => {
        const indent = depth * 20; // Adjust indentation level
        return (
            <VStack key={menu.category} align="flex-start" spacing={4} pl={indent}>
                <Text fontWeight="bold">
                    {menu.category}
                    <Tag style={{ marginLeft: "5px" }}>{menu.categoryPriority}</Tag>
                </Text>
                {menu.childCategory.map((child) => (
                    <VStack key={child.category} align="flex-start" spacing={4}>
                        <Text fontWeight="bold" pl={indent + 20}>
                            {child.category}
                            {
                                child.categoryPriority && (
                                    <Tag> Priority: {child.categoryPriority} </Tag>
                                )
                            }
                        </Text>
                        {child.childCategory.map((subChild) => (
                            <Text key={subChild.category} pl={indent + 40}>
                                {subChild.category}
                                {
                                    subChild.categoryPriority && (
                                        <Tag>Priority: {subChild.categoryPriority}</Tag>
                                    )
                                }
                            </Text>
                        ))}
                    </VStack>
                ))}
            </VStack>
        );
    };

    return (
        <>
            <Button onClick={toggleModal}>Show Category</Button>
            <Modal isOpen={isOpen} onClose={toggleModal} size="xl">
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Categories</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        {data.map((menu) => renderMenu(menu))}
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={toggleModal}>
                            Close
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default CategoryModal;
